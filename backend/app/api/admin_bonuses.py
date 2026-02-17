from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.services import bonus_service
from app.models.bonus import Bonus
from app.models.bonus_usage import BonusUsage
from app.models.user import User
from app.schemas.bonus import BonusCreate, BonusResponse, BonusUsageResponse
from app.models.tenant_country import TenantCountry
from app.models.currency import Currency
router = APIRouter(prefix="/admin/bonuses", tags=["Admin Bonuses"])

@router.post("", response_model=BonusResponse)
def create_bonus(
    data: BonusCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # role_id 2 = TENANT_ADMIN
    if current_user.role_id != 2: 
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return bonus_service.create_bonus_campaign(db, current_user.tenant_id, data)

@router.get("", response_model=List[BonusResponse])
def list_bonuses(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role_id != 2: 
        raise HTTPException(status_code=403, detail="Admin access required")
        
    return db.query(Bonus).filter(Bonus.tenant_id == current_user.tenant_id).all()

@router.get("/active-usage", response_model=List[BonusUsageResponse])
def get_all_player_progress(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role_id != 2: 
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # 1. Fetch data with Joins
    results = db.query(
        BonusUsage, 
        User.email, 
        User.first_name,
        User.last_name,
        Bonus.bonus_name,
        Currency.symbol
    ).join(User, User.user_id == BonusUsage.player_id)\
     .join(Bonus, Bonus.bonus_id == BonusUsage.bonus_id)\
     .join(TenantCountry, (TenantCountry.tenant_id == User.tenant_id) & (TenantCountry.country_code == User.country_code))\
     .join(Currency, Currency.currency_code == TenantCountry.currency_code)\
     .filter(Bonus.tenant_id == current_user.tenant_id).all()

    # 2. Map to response list
    response_data = []
    for b, email, fname, lname, b_name, symbol in results:
        #  Robust Name Logic: 
        # If names exist, use them. If not, use the part of email before @
        full_name = f"{fname or ''} {lname or ''}".strip()
        display_name = full_name if full_name else email.split('@')[0]

        response_data.append({
            "bonus_usage_id": b.bonus_usage_id,
            "player_email": email,
            "player_name": display_name,
            "currency_symbol": symbol or "₹",
            "bonus_name": b_name,
            "bonus_amount": float(b.bonus_amount),
            "wagering_required": float(b.wagering_required),
            "wagering_completed": float(b.wagering_completed),
            "status": b.status,
            "granted_at": b.granted_at,
            "expired_at": b.expired_at
        })

    return response_data