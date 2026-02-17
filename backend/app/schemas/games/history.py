from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional



class GameSessionHistory(BaseModel):
    session_id: UUID
    game_name: str
    status: str
    started_at: datetime
    ended_at: datetime | None


class GameRoundHistory(BaseModel):
    round_number: int
    outcome: str
    started_at: datetime
    ended_at: datetime


class BetHistory(BaseModel):
    bet_amount: float
    win_amount: float
    bet_status: str
    placed_at: datetime


class GameSessionHistoryResponse(BaseModel):
    session_id: UUID
    game_id: UUID
    game_name: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        orm_mode = True