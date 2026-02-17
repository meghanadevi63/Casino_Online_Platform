from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.games.even_odd_service import play_even_odd_round
from app.schemas.games.even_odd import (
    PlayRoundRequest,
    PlayRoundResponse
)

router = APIRouter(
    prefix="/games/even-odd",
    tags=["Even Odd Dice"]
)


@router.post(
    "/play",
    response_model=PlayRoundResponse,
    summary="Play Even–Odd Dice Game",
    description="Places a bet on EVEN or ODD for the selected game session"
)
def play_round(
    data: PlayRoundRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Flow:
    1. Validates active session
    2. Validates tenant-game access
    3. Applies tenant bet overrides
    4. Enforces responsible gaming
    5. Places bet & settles round
    """

    if not current_user.tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Tenant not resolved for current user"
        )

    return play_even_odd_round(
        db=db,
        player_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        game_id=data.game_id,
        bet_choice=data.bet_choice,
        amount=data.amount
    )
