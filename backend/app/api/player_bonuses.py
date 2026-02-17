from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services import bonus_service
from app.models.bonus_usage import BonusUsage
from app.models.bonus import Bonus
from app.models.user import User
from app.models.tenant_country import TenantCountry
from app.models.currency import Currency
from app.schemas.bonus import BonusUsageResponse
from typing import List
from app.models.wallet import Wallet

router = APIRouter(prefix="/bonuses", tags=["Player Bonuses"])

@router.get("/my-progress", response_model=List[BonusUsageResponse])
def my_bonuses(db: Session = Depends(get_db), user = Depends(get_current_user)):
    
    now = datetime.now(timezone.utc)

    
    expired_items = db.query(BonusUsage).filter(
        BonusUsage.player_id == user.user_id,
        BonusUsage.status == 'active',
        BonusUsage.expired_at < now
    ).all()

    for item in expired_items:
        item.status = 'expired'
      
        bonus_wallet = db.query(Wallet).filter(Wallet.wallet_id == item.wallet_id).first()
        if bonus_wallet:
            bonus_wallet.balance -= item.bonus_amount
    
    if expired_items:
        db.commit()

   
    bonus_service.cleanup_expired_bonuses(db, user.user_id)

    #  FETCH DATA
    results = db.query(
        BonusUsage, 
        User.email, 
        User.first_name,
        User.last_name,
        Bonus.bonus_name,
        Currency.symbol
    ).join(Bonus, Bonus.bonus_id == BonusUsage.bonus_id)\
     .join(User, User.user_id == BonusUsage.player_id)\
     .join(TenantCountry, (TenantCountry.tenant_id == User.tenant_id) & (TenantCountry.country_code == User.country_code))\
     .join(Currency, Currency.currency_code == TenantCountry.currency_code)\
     .filter(BonusUsage.player_id == user.user_id)\
     .order_by(BonusUsage.granted_at.desc()).all()

    return [
        {
            "bonus_usage_id": b.bonus_usage_id,
            "player_email": email,
            "player_name": f"{fname} {lname}".strip() if fname else email.split('@')[0],
            "currency_symbol": symbol,
            "bonus_name": name,
            "bonus_amount": float(b.bonus_amount),
            "wagering_required": float(b.wagering_required),
            "wagering_completed": float(b.wagering_completed),
            "status": b.status,
            "granted_at": b.granted_at, # Becomes aware ISO string in JSON
            "expired_at": b.expired_at 
        } for b, email, fname, lname, name, symbol in results
    ]

@router.post("/claim/{usage_id}")
def claim_bonus(usage_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    return bonus_service.claim_bonus_to_cash(db, user.user_id, usage_id)

@router.get("/available")
def list_available(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return bonus_service.get_available_bonuses(db, user.tenant_id, user.user_id)

@router.post("/activate/{bonus_id}")
def start_challenge(bonus_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    return bonus_service.activate_bonus(db, user.user_id, bonus_id)

@router.post("/cancel/{usage_id}")
def cancel_challenge(usage_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    return bonus_service.cancel_bonus(db, user.user_id, usage_id)