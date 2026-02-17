from sqlalchemy.orm import Session
from fastapi import HTTPException
from decimal import Decimal
from sqlalchemy import desc, func
from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType

from datetime import datetime, timedelta, date, timezone

def deposit_to_wallet(db: Session, player_id: str, amount: float):
    deposit_amount = Decimal(str(amount))

    wallet = (
        db.query(Wallet)
        .join(Wallet.wallet_type)
        .filter(
            Wallet.player_id == player_id,
            Wallet.is_active.is_(True),
            Wallet.wallet_type.has(wallet_type_code="CASH")
        )
        .with_for_update()
        .first()
    )

    if not wallet:
        raise HTTPException(status_code=404, detail="CASH wallet not found")

    txn_type = (
        db.query(TransactionType)
        .filter(TransactionType.transaction_code == "DEPOSIT")
        .first()
    )

    if not txn_type:
        raise HTTPException(status_code=500, detail="Transaction type missing")

    balance_before: Decimal = wallet.balance
    balance_after: Decimal = balance_before + deposit_amount

    transaction = WalletTransaction(
        wallet_id=wallet.wallet_id,
        transaction_type_id=txn_type.transaction_type_id,
        amount=deposit_amount,
        balance_before=balance_before,
        balance_after=balance_after,
        reference_type="DEPOSIT",
        reference_id=None
        
    )

    wallet.balance = balance_after
    db.add(transaction)
    db.commit()
    db.refresh(wallet)

    return {
        "wallet_id": str(wallet.wallet_id),
        "balance_before": float(balance_before),
        "balance_after": float(balance_after)
    }


def get_player_transactions(db: Session, player_id: str, specific_date: date = None, days: int = None, txn_type: str = None, limit: int = 100):
    query = db.query(WalletTransaction, TransactionType.transaction_code)\
              .join(Wallet, Wallet.wallet_id == WalletTransaction.wallet_id)\
              .join(TransactionType, TransactionType.transaction_type_id == WalletTransaction.transaction_type_id)\
              .filter(Wallet.player_id == player_id)

    if specific_date:
        
        query = query.filter(func.date(WalletTransaction.created_at) == specific_date)
    
    elif days:
    
        now_aware = datetime.now(timezone.utc)
        start_date = now_aware - timedelta(days=days)
        query = query.filter(WalletTransaction.created_at >= start_date)

    if txn_type:
        query = query.filter(TransactionType.transaction_code == txn_type.upper())

    rows = query.order_by(desc(WalletTransaction.created_at)).limit(limit).all()

    return [
        {
            "transaction_id": str(wt.transaction_id),
            "type": code,
            "amount": float(wt.amount),
            "balance_before": float(wt.balance_before),
            "balance_after": float(wt.balance_after),
            "created_at": wt.created_at
        }
        for wt, code in rows
    ]