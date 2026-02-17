from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.games.dice import DiceBetRequest, DiceBetResponse
from app.services.games.dice_service import place_dice_bet

router = APIRouter(
    prefix="/games/dice",
    tags=["Dice Game"]
)


@router.post(
    "/bet",
    response_model=DiceBetResponse,
    summary="Place Dice Bet",
    description="Places an EVEN / ODD dice bet for an enabled tenant game"
)
def dice_bet(
    data: DiceBetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Tenant not resolved for current user"
        )

    return place_dice_bet(
        db=db,
        player_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        game_id=data.game_id,
        bet_choice=data.bet_choice,
        amount=Decimal(str(data.amount))
    )
