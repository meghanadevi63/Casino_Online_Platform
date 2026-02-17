from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.game import Game
from app.models.game_category import GameCategory
from app.models.tenant_game import TenantGame
from app.schemas.games.game import GameListResponse
from app.schemas.game_eligibility import GameEligibilityResponse
from app.services.game_eligibility_service import check_game_eligibility
from app.models.user import User

router = APIRouter(
    prefix="/games",
    tags=["Games"]
)

#  LIST GAMES (TENANT ENABLED)
@router.get("", response_model=list[GameListResponse])
def list_games(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rows = (
        db.query(Game, GameCategory, TenantGame)
        .join(TenantGame, TenantGame.game_id == Game.game_id)
        .join(GameCategory, Game.category_id == GameCategory.category_id)
        .filter(
            TenantGame.tenant_id == current_user.tenant_id,
            TenantGame.is_active.is_(True),
            Game.is_active.is_(True)
        )
        .order_by(Game.created_at.desc())
        .all()
    )

    return [
        {
            "game_id": game.game_id,
            "game_name": game.game_name,
            "game_code": game.game_code,
            "category": category.category_name if category else None,
            "min_bet": float(
                tenant_game.min_bet_override
                if tenant_game.min_bet_override is not None
                else game.min_bet
            ),
            "max_bet": float(
                tenant_game.max_bet_override
                if tenant_game.max_bet_override is not None
                else game.max_bet
            ),
            "is_active": tenant_game.is_active
        }
        for game, category, tenant_game in rows
    ]


#  GAME ELIGIBILITY (TENANT SAFE)
@router.get("/{game_id}/eligibility", response_model=GameEligibilityResponse)
def game_eligibility(
    game_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return check_game_eligibility(
    db=db,
    player_id=current_user.user_id,
    tenant_id=current_user.tenant_id,
    game_id=game_id
)


# GET SINGLE GAME (TENANT + GLOBAL SAFE)
@router.get("/{game_id}", response_model=GameListResponse)
def get_game_by_id(
    game_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = (
        db.query(Game, GameCategory, TenantGame)
        .join(TenantGame, TenantGame.game_id == Game.game_id)
        .join(GameCategory, Game.category_id == GameCategory.category_id)
        .filter(
            TenantGame.tenant_id == current_user.tenant_id,
            TenantGame.is_active.is_(True),
            Game.is_active.is_(True),
            Game.game_id == game_id
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Game not available for this tenant"
        )

    game, category, tenant_game = result

    return {
        "game_id": game.game_id,
        "game_name": game.game_name,
        "game_code": game.game_code,
        "category": category.category_name if category else None,
        "min_bet": float(
            tenant_game.min_bet_override
            if tenant_game.min_bet_override is not None
            else game.min_bet
        ),
        "max_bet": float(
            tenant_game.max_bet_override
            if tenant_game.max_bet_override is not None
            else game.max_bet
        ),
        "is_active": tenant_game.is_active
    }
