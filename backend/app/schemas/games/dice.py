from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID
from decimal import Decimal


class DiceBetRequest(BaseModel):
    game_id: UUID
    bet_choice: Literal["EVEN", "ODD"]
    amount: Decimal = Field(..., gt=0, example="100.00")


class DiceBetResponse(BaseModel):
    game: Literal["DICE"]
    session_id: UUID
    round_id: UUID

    dice_roll: int
    bet_choice: Literal["EVEN", "ODD"]
    outcome: Literal["EVEN", "ODD"]

    win: bool
    win_amount: Decimal

    balance_before: Decimal
    balance_after: Decimal
