from pydantic import BaseModel
from datetime import date
from typing import Optional

from uuid import UUID



# PLATFORM OVERVIEW

class PlatformTenantStats(BaseModel):
    total: int
    active: int


class PlatformFinancialStats(BaseModel):
    total_bets: float
    total_wins: float
    ggr: float
    rtp_percentage: Optional[float]


class PlatformPlayerStats(BaseModel):
    total_players: int


class PlatformDateRange(BaseModel):
    start: date
    end: date


class PlatformOverviewResponse(BaseModel):
    tenants: PlatformTenantStats
    financials: PlatformFinancialStats
    players: PlatformPlayerStats
    date_range: PlatformDateRange

    class Config:
        from_attributes = True



# TENANT ANALYTICS

class SuperTenantAnalyticsResponse(BaseModel):
    tenant_id: UUID
    tenant_name: str

    total_bets: float
    total_wins: float
    ggr: float

    active_players: int

    class Config:
        from_attributes = True



# GAME ANALYTICS (CROSS TENANT)

class SuperGameAnalyticsResponse(BaseModel):
    game_id: UUID
    game_name: str

    total_bets: float
    total_wins: float
    ggr: float

    active_players: int
    tenants_running: int

    class Config:
        from_attributes = True
