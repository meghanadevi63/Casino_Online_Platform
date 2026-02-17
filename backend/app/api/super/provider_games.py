from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.super.super_provider_game import ProviderGameResponse
from app.services.super.provider_game_service import get_provider_games

router = APIRouter(
    prefix="/super/providers",
    tags=["Super Admin - Provider Games"]
)


def super_admin_only(user: User):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")


@router.get(
    "/{provider_id}/games",
    response_model=List[ProviderGameResponse]
)
def list_provider_games(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    return get_provider_games(db, provider_id)
