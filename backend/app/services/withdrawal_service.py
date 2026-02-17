from sqlalchemy.orm import Session
from fastapi import HTTPException
from decimal import Decimal

from datetime import datetime, timezone 

from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType
from app.models.withdrawal import Withdrawal
from app.models.wallet_type import WalletType
from app.models.player import Player


def withdraw_from_wallet(
    db: Session,
    player_id,
    tenant_id,
    amount: float
):
    withdraw_amount = Decimal(str(amount))

    # Fetch player & KYC status
    player = (
        db.query(Player)
        .filter(Player.player_id == player_id)
        .first()
    )

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    #  Hard block if KYC rejected / expired
    if player.kyc_status in ("rejected", "expired"):
        raise HTTPException(
            status_code=403,
            detail=f"Withdrawal blocked due to KYC status: {player.kyc_status}"
        )

    #  Fetch active CASH wallet (locked)
    wallet = (
        db.query(Wallet)
        .join(WalletType)
        .filter(
            Wallet.player_id == player_id,
            Wallet.tenant_id == tenant_id,
            Wallet.is_active.is_(True),
            WalletType.wallet_type_code == "CASH"
        )
        .with_for_update()
        .first()
    )

    if not wallet:
        raise HTTPException(status_code=404, detail="CASH wallet not found")

    #  Balance check
    if wallet.balance < withdraw_amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    #  Fetch WITHDRAWAL transaction type
    txn_type = (
        db.query(TransactionType)
        .filter(TransactionType.transaction_code == "WITHDRAWAL")
        .first()
    )

    if not txn_type:
        raise HTTPException(status_code=500, detail="Transaction type missing")

    balance_before = wallet.balance
    balance_after = balance_before - withdraw_amount

    #  Determine withdrawal status via KYC
    withdrawal_status = (
        "requested"
        if player.kyc_status == "verified"
        else "kyc_pending"
    )

    #  Create withdrawal record
    withdrawal = Withdrawal(
        player_id=player_id,
        tenant_id=tenant_id,
        wallet_id=wallet.wallet_id,
        amount=withdraw_amount,
        currency_id=wallet.currency_id,
        status=withdrawal_status
        # requested_at is handled by DB server_default=func.now()
    )

    db.add(withdrawal)
    db.flush()  # get withdrawal_id

    #  Wallet transaction ledger
    transaction = WalletTransaction(
        wallet_id=wallet.wallet_id,
        transaction_type_id=txn_type.transaction_type_id,
        amount=withdraw_amount,
        balance_before=balance_before,
        balance_after=balance_after,
        reference_type="WITHDRAWAL",
        reference_id=withdrawal.withdrawal_id
        # created_at is handled by DB server_default=func.now()
    )

    # 8️s Apply wallet update
    wallet.balance = balance_after

    db.add(transaction)
    db.commit()
    db.refresh(wallet)

    return {
        "withdrawal_id": str(withdrawal.withdrawal_id),
        "wallet_id": str(wallet.wallet_id),
        "balance_before": float(balance_before),
        "balance_after": float(balance_after),
        "status": withdrawal.status,
        "kyc_status": player.kyc_status
    }