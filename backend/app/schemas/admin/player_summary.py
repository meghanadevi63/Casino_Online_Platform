from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class PlayerSummaryResponse(BaseModel):
    player_id: str
    email: str
    first_name: str
    last_name: str
    status: str
    kyc_status: Optional[str]
    country_code: Optional[str]

    currency_code: str
    currency_symbol: str
    decimal_places: int

    created_at: datetime

    wallet_balance: float

    total_sessions: int
    total_rounds: int
    total_bet_amount: float
    total_win_amount: float
    ggr: float

    daily_bet_limit: Optional[float]
    monthly_bet_limit: Optional[float]
    self_exclusion_until: Optional[date]

    class Config:
        from_attributes = True

