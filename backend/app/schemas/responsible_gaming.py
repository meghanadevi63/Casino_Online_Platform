from pydantic import BaseModel
from typing import Optional
from datetime import date


class ResponsibleLimitsRequest(BaseModel):
    daily_deposit_limit: Optional[float] = None
    daily_bet_limit: Optional[float] = None
    monthly_bet_limit: Optional[float] = None


class SelfExcludeRequest(BaseModel):
    self_exclusion_until: date


class ResponsibleLimitsResponse(BaseModel):
    daily_deposit_limit: Optional[float]
    daily_bet_limit: Optional[float]
    monthly_bet_limit: Optional[float]
    self_exclusion_until: Optional[date]

    class Config:
        from_attributes = True

class ResponsibleLimitsUsageResponse(BaseModel):
    daily_bet_limit: Optional[float]
    daily_bet_used: float
    daily_bet_remaining: Optional[float]

    monthly_bet_limit: Optional[float]
    monthly_bet_used: float
    monthly_bet_remaining: Optional[float]

    self_exclusion_until: Optional[date]

    class Config:
        from_attributes = True
