from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.admin_games import TenantGameListResponse, TenantGameUpdate
from app.services.admin_games_service import list_tenant_games, update_tenant_game_config

router = APIRouter(
    prefix="/tenant/games",
    tags=["Tenant Admin - My Games"]
)

def tenant_admin_only(user: User):
    if user.role_id != 2: # 2 = Tenant Admin
        raise HTTPException(status_code=403, detail="Tenant Admin access required")

@router.get("", response_model=list[TenantGameListResponse])
def get_my_games(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant_admin_only(current_user)
    return list_tenant_games(db, current_user.tenant_id)

@router.patch("/{game_id}")
def update_game(
    game_id: UUID,
    payload: TenantGameUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant_admin_only(current_user)
    return update_tenant_game_config(
        db, 
        current_user.tenant_id, 
        game_id, 
        payload, 
        current_user
    )