from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from fastapi import HTTPException

from datetime import datetime, timezone, date
from decimal import Decimal
from app.models.bonus import Bonus
from app.models.bonus_usage import BonusUsage
from app.models.wallet import Wallet
from app.models.wallet_type import WalletType
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType

def create_bonus_campaign(db: Session, tenant_id, data):
    new_bonus = Bonus(
        tenant_id=tenant_id,
        bonus_name=data.bonus_name,
        bonus_type=data.bonus_type,
        bonus_amount=data.bonus_amount,
        wagering_multiplier=data.wagering_multiplier,
        valid_from=data.valid_from,
        valid_to=data.valid_to,
        is_active=data.is_active
    )
    db.add(new_bonus)
    db.commit()
    db.refresh(new_bonus)
    return new_bonus

def get_available_bonuses(db: Session, tenant_id: str, player_id: str):
    """
    Returns bonuses that are currently active and haven't been started by the player.
    """
    
    now = datetime.now(timezone.utc)
    
    # Get IDs of bonuses the player already has/had
    used_bonus_ids = db.query(BonusUsage.bonus_id).filter(
        BonusUsage.player_id == player_id
    ).all()
    used_ids = [r[0] for r in used_bonus_ids]

    return db.query(Bonus).filter(
        Bonus.tenant_id == tenant_id,
        Bonus.is_active == True,
        Bonus.valid_from <= now,
        Bonus.valid_to > now, 
        ~Bonus.bonus_id.in_(used_ids)
    ).all()

def activate_bonus(db: Session, player_id: str, bonus_id: str):
    # 1. Enforce One Active Bonus Rule
    existing_active = db.query(BonusUsage).filter(
        BonusUsage.player_id == player_id,
        BonusUsage.status.in_(['active', 'claimable'])
    ).first()

    if existing_active:
        raise HTTPException(
            status_code=400, 
            detail="You already have an active challenge. Complete or cancel it first."
        )

    # 2. Fetch and validate the campaign
    bonus = db.query(Bonus).filter(Bonus.bonus_id == bonus_id).first()
    if not bonus or not bonus.is_active:
        raise HTTPException(status_code=404, detail="Bonus offer not found or inactive")

    
    now = datetime.now(timezone.utc)
    if now > bonus.valid_to:
        raise HTTPException(status_code=400, detail="This promotion has already expired")

    # 3. Find and lock the player's BONUS wallet
    bonus_wallet = db.query(Wallet).join(WalletType).filter(
        Wallet.player_id == player_id,
        WalletType.wallet_type_code =="BONUS"
    ).with_for_update().first()

    if not bonus_wallet:
        raise HTTPException(status_code=400, detail="Bonus Wallet not initialized for this player")

    # 4. Calculate target and initialize Usage record
    wagering_target = bonus.bonus_amount * bonus.wagering_multiplier

    new_usage = BonusUsage(
        bonus_id=bonus_id,
        player_id=player_id,
        wallet_id=bonus_wallet.wallet_id,
        bonus_amount=bonus.bonus_amount,
        wagering_required=wagering_target,
        wagering_completed=0,
        status='active',
        expired_at=bonus.valid_to 
    )
    
    # 5. Add the amount to the BONUS wallet balance
    bonus_wallet.balance += Decimal(str(bonus.bonus_amount))

    db.add(new_usage)
    db.commit()
    db.refresh(new_usage)
    return new_usage

def update_wagering_progress(db: Session, player_id: str, bet_amount: Decimal):
    """
    Called by Game Services. Updates progress and handles hard expiry.
    """
    
    now = datetime.now(timezone.utc)
    
    usage = db.query(BonusUsage).filter(
        BonusUsage.player_id == player_id,
        BonusUsage.status == 'active'
    ).with_for_update().first()

    if usage:
        # Check if the deadline has passed
        # Now both 'now' and 'usage.expired_at' are offset-aware
        if now > usage.expired_at:
            usage.status = 'expired'
            bw = db.query(Wallet).filter(Wallet.wallet_id == usage.wallet_id).with_for_update().first()
            if bw:
                bw.balance -= usage.bonus_amount
            db.flush()
            return

        # Update progress
        usage.wagering_completed += bet_amount
        if usage.wagering_completed >= usage.wagering_required:
            usage.status = 'claimable'
        db.flush()

def cleanup_expired_bonuses(db: Session, player_id: str):
    """
    Auto-expire bonuses that passed their deadline.
    """
    now = datetime.now(timezone.utc)
    
    expired_items = db.query(BonusUsage).filter(
        BonusUsage.player_id == player_id,
        BonusUsage.status == 'active',
        BonusUsage.expired_at < now
    ).all()

    for item in expired_items:
        item.status = 'expired'
        bw = db.query(Wallet).filter(Wallet.wallet_id == item.wallet_id).first()
        if bw:
            bw.balance -= item.bonus_amount
    
    if expired_items:
        db.commit()

def claim_bonus_to_cash(db: Session, player_id: str, usage_id: str):
    usage = db.query(BonusUsage).filter(
        BonusUsage.bonus_usage_id == usage_id,
        BonusUsage.player_id == player_id,
        BonusUsage.status == 'claimable'
    ).with_for_update().first()

    if not usage:
        raise HTTPException(status_code=400, detail="Bonus not found or not ready to claim")

    bonus_wallet = db.query(Wallet).filter(Wallet.wallet_id == usage.wallet_id).with_for_update().first()
    cash_wallet = db.query(Wallet).join(WalletType).filter(
        Wallet.player_id == player_id,
        WalletType.wallet_type_code == "CASH"
    ).with_for_update().first()

    if not bonus_wallet or not cash_wallet:
        raise HTTPException(status_code=500, detail="Wallet configuration error")

    txn_type = db.query(TransactionType).filter_by(transaction_code="BONUS_CONVERSION").first()
    reward = Decimal(str(usage.bonus_amount))
    
    bonus_wallet.balance -= reward
    cash_balance_before = cash_wallet.balance
    cash_wallet.balance += reward
    
    transaction = WalletTransaction(
        wallet_id=cash_wallet.wallet_id,
        transaction_type_id=txn_type.transaction_type_id,
        amount=reward,
        balance_before=cash_balance_before,
        balance_after=cash_wallet.balance,
        reference_type="BONUS_CLAIM",
        reference_id=usage.bonus_usage_id
    )

    usage.status = 'completed'
    
    usage.completed_at = datetime.now(timezone.utc)
    
    db.add(transaction)
    db.commit()
    
    return {
        "status": "success", 
        "claimed_amount": float(reward),
        "new_cash_balance": float(cash_wallet.balance)
    }

def cancel_bonus(db: Session, player_id: str, usage_id: str):
    usage = db.query(BonusUsage).filter(
        BonusUsage.bonus_usage_id == usage_id,
        BonusUsage.player_id == player_id,
        BonusUsage.status.in_(['active', 'claimable'])
    ).with_for_update().first()

    if not usage:
        raise HTTPException(status_code=404, detail="Active challenge not found")

    bonus_wallet = db.query(Wallet).filter(
        Wallet.wallet_id == usage.wallet_id
    ).with_for_update().first()
    
    if bonus_wallet:
        bonus_wallet.balance -= usage.bonus_amount

    usage.status = 'cancelled'
    db.commit()
    return {"message": "Challenge cancelled and bonus funds removed"}