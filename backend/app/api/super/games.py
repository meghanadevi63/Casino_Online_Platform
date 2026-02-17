from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.super_game import SuperGameCreate, SuperGameResponse
from app.services.super_game_service import list_games, create_game

router = APIRouter(
    prefix="/super/games",
    tags=["Super Admin - Games"]
)


def require_super_admin(user: User):
    if user.role_id != 4:
        raise HTTPException(
            status_code=403,
            detail="Super admin access required"
        )


@router.get(
    "",
    response_model=list[SuperGameResponse],
    operation_id="super_list_games"
)
def get_games(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return list_games(db)


@router.post(
    "",
    response_model=SuperGameResponse,
    operation_id="super_create_game"
)
def add_game(
    data: SuperGameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return create_game(db, data,actor_user=current_user)
