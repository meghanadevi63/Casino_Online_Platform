from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.super.super_game_country import (
    GameCountryResponse,
    GameCountryUpdate
)
from app.services.super.game_country_service import (
    list_game_countries,
    update_game_country
)

router = APIRouter(
    prefix="/super/games",
    tags=["Super Admin - Game Countries"]
)


def super_admin_only(user: User):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")


@router.get(
    "/{game_id}/countries",
    response_model=List[GameCountryResponse]
)
def get_game_countries(
    game_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    return list_game_countries(db, game_id)


@router.patch(
    "/{game_id}/countries/{country_code}",
    response_model=dict
)
def update_game_country_api(
    game_id: UUID,
    country_code: str,
    payload: GameCountryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    return update_game_country(
        db=db,
        game_id=game_id,
        country_code=country_code,
        is_allowed=payload.is_allowed,
        actor_user=current_user
    )
