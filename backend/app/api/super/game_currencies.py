from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.super.super_game_currency import (
    GameCurrencyResponse,
    GameCurrencyUpdate
)
from app.services.super.game_currency_service import (
    list_game_currencies,
    update_game_currency
)

router = APIRouter(
    prefix="/super/games",
    tags=["Super Admin - Game Currencies"]
)


def super_admin_only(user: User):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")


@router.get(
    "/{game_id}/currencies",
    response_model=List[GameCurrencyResponse]
)
def get_game_currencies(
    game_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    return list_game_currencies(db, game_id)


@router.patch(
    "/{game_id}/currencies/{currency_id}",
    response_model=dict
)
def update_game_currency_api(
    game_id: UUID,
    currency_id: int,
    payload: GameCurrencyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    return update_game_currency(
        db=db,
        game_id=game_id,
        currency_id=currency_id,
        is_allowed=payload.is_allowed,
        actor_user=current_user
    )
