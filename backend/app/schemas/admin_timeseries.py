from datetime import date
from pydantic import BaseModel

class GameTimeSeriesResponse(BaseModel):
    date: date
    total_bets: float
    total_wins: float
    ggr: float
    total_players: int
    active_players: int
