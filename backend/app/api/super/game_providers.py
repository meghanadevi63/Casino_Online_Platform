from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

from app.schemas.super_game_provider import (
    GameProviderCreate,
    GameProviderUpdate,
    GameProviderResponse
)
from app.services.super_game_provider_service import (
    list_game_providers,
    create_game_provider,
    update_game_provider
)

router = APIRouter(
    prefix="/super/game-providers",
    tags=["Super Admin - Game Providers"]
)


def require_super_admin(user: User):
    if user.role_id != 4:
        raise HTTPException(
            status_code=403,
            detail="Super admin access required"
        )


#  LIST
@router.get("", response_model=list[GameProviderResponse])
def get_game_providers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return list_game_providers(db)


#  CREATE
@router.post("", response_model=GameProviderResponse)
def add_game_provider(
    data: GameProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return create_game_provider(db, data,actor_user=current_user)


#  UPDATE
@router.patch("/{provider_id}", response_model=GameProviderResponse)
def edit_game_provider(
    provider_id: int,
    data: GameProviderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return update_game_provider(db, provider_id, data,actor_user=current_user)
