from sqlalchemy.orm import Session
from fastapi import HTTPException

from datetime import datetime, timezone 
from decimal import Decimal
from sqlalchemy import desc 
from app.models.withdrawal import Withdrawal
from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType
from app.models.user import User 
from app.models.currency import Currency
from app.services.notification_service import send_notification

def admin_process_withdrawal(
    db: Session,
    withdrawal_id: str,
    action: str,
    admin_user_id: str,
    rejection_reason: str | None = None,
    gateway_reference: str | None = None
):
    # 1️ Lock withdrawal
    withdrawal = (
        db.query(Withdrawal)
        .filter(Withdrawal.withdrawal_id == withdrawal_id)
        .with_for_update()
        .first()
    )

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    
    now = datetime.now(timezone.utc)

    #  APPROVE 
    if action == "approve":
        if withdrawal.status not in ("requested", "kyc_pending"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot approve withdrawal in status {withdrawal.status}"
            )

        withdrawal.status = "approved"
        send_notification(
            db, withdrawal.player_id, 
            "Withdrawal Approved", 
            f"Your request for payout of {withdrawal.amount} is approved and is being processed.",
            "WITHDRAWAL"
        )
        
        withdrawal.processed_at = now

    # PROCESS 
    elif action == "process":
        if withdrawal.status != "approved":
            raise HTTPException(
                status_code=400,
                detail="Only approved withdrawals can be processed"
            )

        withdrawal.status = "processing"

    #  COMPLETE 
    elif action == "complete":
        if withdrawal.status != "processing":
            raise HTTPException(
                status_code=400,
                detail="Only processing withdrawals can be completed"
            )

        if not gateway_reference:
            raise HTTPException(
                status_code=400,
                detail="Gateway reference required"
            )

        withdrawal.status = "completed"
        withdrawal.gateway_reference = gateway_reference
        
        send_notification(
            db, withdrawal.player_id, 
            "Payout Successful", 
            f"Funds ({withdrawal.amount}) have been sent to your account. Ref: {gateway_reference}",
            "WITHDRAWAL"
        )
        
        withdrawal.processed_at = now

    #  REJECT 
    elif action == "reject":
        if withdrawal.status not in ("requested", "kyc_pending", "approved"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot reject withdrawal in status {withdrawal.status}"
            )

        if not rejection_reason:
            raise HTTPException(
                status_code=400,
                detail="Rejection reason required"
            )

        # Lock wallet
        wallet = (
            db.query(Wallet)
            .filter(Wallet.wallet_id == withdrawal.wallet_id)
            .with_for_update()
            .first()
        )

        if not wallet:
            raise HTTPException(
                status_code=500,
                detail="Wallet not found for withdrawal"
            )

        refund_txn_type = (
            db.query(TransactionType)
            .filter(TransactionType.transaction_code == "WITHDRAWAL_REFUND")
            .first()
        )

        if not refund_txn_type:
            raise HTTPException(
                status_code=500,
                detail="WITHDRAWAL_REFUND transaction type missing"
            )

        refund_amount = Decimal(withdrawal.amount)
        balance_before = wallet.balance
        balance_after = balance_before + refund_amount

        refund_txn = WalletTransaction(
            wallet_id=wallet.wallet_id,
            transaction_type_id=refund_txn_type.transaction_type_id,
            amount=refund_amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference_type="WITHDRAWAL_REFUND",
            reference_id=withdrawal.withdrawal_id
            # created_at handled by DB server_default=func.now()
        )

        wallet.balance = balance_after
        withdrawal.status = "rejected"
        withdrawal.rejection_reason = rejection_reason
        
        send_notification(
            db, withdrawal.player_id, 
            "Withdrawal Rejected", 
            f"Your payout request was declined. Reason: {rejection_reason}",
            "WITHDRAWAL"
        )
        
        withdrawal.processed_at = now

        db.add(refund_txn)

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.commit()

    return {
        "withdrawal_id": str(withdrawal.withdrawal_id),
        "status": withdrawal.status,
        "gateway_reference": withdrawal.gateway_reference,
        "rejection_reason": withdrawal.rejection_reason
    }


def admin_list_withdrawals(db: Session, tenant_id: str, status: str = None):
    """
    Fetches all withdrawals for a specific tenant.
    """
    query = db.query(Withdrawal, User.email, Currency.symbol)\
              .join(User, User.user_id == Withdrawal.player_id)\
              .join(Currency, Currency.currency_id == Withdrawal.currency_id)\
              .filter(Withdrawal.tenant_id == tenant_id)

    if status:
        query = query.filter(Withdrawal.status == status)

    rows = query.order_by(desc(Withdrawal.requested_at)).all()

    return [
        {
            "withdrawal_id": str(w.withdrawal_id),
            "player_email": email,
            "amount": float(w.amount),
            "currency_symbol": symbol,
            "status": w.status,
            "requested_at": w.requested_at,
            "gateway_reference": w.gateway_reference
        }
        for w, email, symbol in rows
    ]