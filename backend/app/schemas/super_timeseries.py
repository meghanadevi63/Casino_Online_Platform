from pydantic import BaseModel
from datetime import date

class SuperTimeSeriesResponse(BaseModel):
    date: date
    total_bets: float
    total_wins: float
    ggr: float
    active_players: int

    class Config:
        from_attributes = True   
