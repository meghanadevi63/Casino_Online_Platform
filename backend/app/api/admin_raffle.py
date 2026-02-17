from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.raffle_jackpot import (
    JackpotCreate, 
    JackpotResponse, 
    JackpotDrawResponse, 
    TenantCurrencyResponse 
)
from app.services.raffle_service import (
    create_new_jackpot, 
    perform_draw_logic,
    cancel_jackpot_logic,       
    get_admin_tenant_currencies,
    get_admin_jackpots_list 
)
from app.models.raffle_jackpot import RaffleJackpot

router = APIRouter(prefix="/admin/raffle", tags=["Admin - Jackpot Raffle"])

def admin_only(user):
    # role_id 2 = Tenant Admin, 4 = Super Admin
    if user.role_id not in (2, 4):
        raise HTTPException(status_code=403, detail="Admin access required")

@router.post("", response_model=JackpotResponse)
def admin_create_jackpot(data: JackpotCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    admin_only(current_user)
    return create_new_jackpot(db, current_user.tenant_id, data)

@router.get("", response_model=List[JackpotResponse])
def admin_list_jackpots(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    admin_only(current_user)
    return get_admin_jackpots_list(db, current_user.tenant_id)

@router.get("/currencies", response_model=List[TenantCurrencyResponse])
def admin_get_currencies(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Fetch only currencies enabled for this specific tenant"""
    admin_only(current_user)
    return get_admin_tenant_currencies(db, current_user.tenant_id)

@router.post("/{jackpot_id}/draw", response_model=JackpotDrawResponse)
def admin_trigger_draw(jackpot_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    admin_only(current_user)
    return perform_draw_logic(db, current_user.tenant_id, jackpot_id)

@router.delete("/{jackpot_id}")
def admin_cancel_jackpot(jackpot_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Cancel jackpot and refund all players"""
    admin_only(current_user)
    return cancel_jackpot_logic(db, current_user.tenant_id, jackpot_id)