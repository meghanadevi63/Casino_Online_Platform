from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.admin_marketplace import MarketplaceGameResponse, AddGameRequest, RequestAccessPayload
from app.services.admin_marketplace_service import (
    get_marketplace_catalog, 
    add_game_to_library,
    request_provider_access,
    get_tenant_requests
)

router = APIRouter(
    prefix="/tenant/marketplace",
    tags=["Tenant Admin - Marketplace"]
)

def tenant_admin_only(user: User):
    if user.role_id != 2:
        raise HTTPException(status_code=403, detail="Tenant Admin access required")

@router.get("", response_model=List[MarketplaceGameResponse])
def get_catalog(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tenant_admin_only(current_user)
    return get_marketplace_catalog(db, current_user.tenant_id)

@router.post("/add")
def add_game(
    payload: AddGameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant_admin_only(current_user)
    return add_game_to_library(db, current_user.tenant_id, payload, current_user)

@router.post("/request-access")
def request_access(
    payload: RequestAccessPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant_admin_only(current_user)
    return request_provider_access(
        db, 
        current_user.tenant_id, 
        payload.provider_id, 
        payload.proposed_start_date, 
        current_user
    )

@router.get("/requests")
def list_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant_admin_only(current_user)
    return get_tenant_requests(db, current_user.tenant_id)