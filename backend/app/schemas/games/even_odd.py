from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID


class StartSessionResponse(BaseModel):
    session_id: UUID
    status: str


class PlayRoundRequest(BaseModel):
    game_id: UUID
    bet_choice: Literal["EVEN", "ODD"]
    amount: float = Field(..., gt=0)


class PlayRoundResponse(BaseModel):
    session_id: UUID
    round_id: UUID
    dice_roll: int
    bet_choice: str
    outcome: str
    win: bool
    win_amount: float
    bet_amount: float 
    balance_after: float
