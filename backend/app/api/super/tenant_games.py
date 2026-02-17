
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

from app.schemas.super_tenant_game import (
    TenantGameCreate,
    TenantGameUpdate,
    TenantGameResponse
)
from app.services.super_tenant_game_service import (
    list_tenant_games,
    add_game_to_tenant,
    update_tenant_game
)

router = APIRouter(
    prefix="/super/tenants",
    tags=["Super Admin - Tenant Games"]
)


def require_super_admin(user: User):
    if user.role_id != 4:
        raise HTTPException(status_code=403, detail="Super admin access required")


@router.get(
    "/{tenant_id}/games",
    response_model=list[TenantGameResponse]
)
def get_tenant_games(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return list_tenant_games(db, tenant_id)


@router.post(
    "/{tenant_id}/games",
    response_model=TenantGameResponse
)
def enable_game_for_tenant(
    tenant_id: UUID,
    data: TenantGameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return add_game_to_tenant(db, tenant_id, data,actor_user=current_user)


@router.patch(
    "/{tenant_id}/games/{game_id}",
    response_model=TenantGameResponse
)
def update_tenant_game_api(
    tenant_id: UUID,
    game_id: UUID,
    data: TenantGameUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return update_tenant_game(db, tenant_id, game_id, data, actor_user=current_user)
