from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.wallet import Wallet
from app.models.wallet_type import WalletType
from app.core.security import get_current_user
from app.models.user import User

from app.schemas.wallet import DepositRequest, WithdrawRequest
from app.services.wallet_service import deposit_to_wallet, get_player_transactions 
from app.services.withdrawal_service import withdraw_from_wallet

router = APIRouter(prefix="/wallets", tags=["Wallets"])

@router.get("/{player_id}")
def get_wallets(
    player_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.user_id) != player_id:
        raise HTTPException(status_code=403, detail="Access denied")

    wallets = (
        db.query(Wallet, WalletType.wallet_type_code)
        .join(WalletType)
        .filter(Wallet.player_id == player_id)
        .all()
    )

    return [
        {
            "wallet_id": str(w.wallet_id),
            "wallet_type": wallet_type,
            "balance": float(w.balance),
            "currency_id": w.currency_id
        }
        for w, wallet_type in wallets
    ]

@router.post("/deposit")
def deposit(
    data: DepositRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return deposit_to_wallet(
        db=db,
        player_id=current_user.user_id,
        amount=data.amount
    )

@router.post("/withdraw", summary="Withdraw from wallet")
def withdraw(
    data: WithdrawRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return withdraw_from_wallet(
        db=db,
        player_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        amount=data.amount
    )

@router.get("/transactions/me")
def get_my_transactions(
    specific_date: date = None, 
    days: int = None, 
    txn_type: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # specific_date is a 'date' object (naive), which is correct for YYYY-MM-DD filtering
    return get_player_transactions(
        db, 
        player_id=current_user.user_id,
        specific_date=specific_date, 
        days=days, 
        txn_type=txn_type
    )

@router.get("/withdrawals/me")
def get_my_withdrawals(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from app.models.withdrawal import Withdrawal
    from app.models.currency import Currency

    # Fetch withdrawals with currency info
    rows = (
        db.query(Withdrawal, Currency.symbol)
        .join(Currency, Currency.currency_id == Withdrawal.currency_id)
        .filter(Withdrawal.player_id == current_user.user_id)
        .order_by(Withdrawal.requested_at.desc()) # requested_at is now TIMESTAMPTZ aware
        .all()
    )

    return [
        {
            "withdrawal_id": str(w.withdrawal_id),
            "amount": float(w.amount),
            "status": w.status,
            "currency_symbol": symbol,
            "requested_at": w.requested_at, # FastAPI serializes aware datetime to ISO with Z offset
            "rejection_reason": w.rejection_reason
        }
        for w, symbol in rows
    ]