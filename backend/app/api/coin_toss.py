from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.coin_toss_service import play_coin_toss_round
from app.schemas.coin_toss import CoinTossBetRequest

router = APIRouter(
    prefix="/games/coin-toss",
    tags=["Coin Toss Game"]
)


@router.post(
    "/play",
    summary="Play Coin Toss",
    description="Places a HEAD / TAIL bet for an enabled tenant game"
)
def play_round(
    data: CoinTossBetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Tenant not resolved for current user"
        )

    return play_coin_toss_round(
        db=db,
        player_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        game_id=data.game_id,
        choice=data.choice,
        amount=data.bet_amount
    )
