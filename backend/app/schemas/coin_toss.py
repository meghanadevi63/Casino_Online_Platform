from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Literal
from decimal import Decimal

class StartCoinTossSessionResponse(BaseModel):
    session_id: UUID
    status: str
    started_at: datetime

class CoinTossBetRequest(BaseModel):
    game_id: UUID
    choice: Literal["HEAD", "TAIL"]
    bet_amount: Decimal

class CoinTossBetResponse(BaseModel):
    session_id: UUID        
    round_id: UUID
    player_choice: str      
    outcome: str
    win: bool               
    bet_amount: float
    win_amount: float
    balance_after: float    