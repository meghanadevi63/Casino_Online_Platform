from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime
class GameAnalyticsResponse(BaseModel):
    game_id: UUID
    game_name: str

    total_sessions: int
    total_rounds: Optional[int]

    total_bet_amount: float
    total_win_amount: float

    ggr: float
    rtp_percentage: Optional[float]

    total_players: int
    active_players: int


class DashboardFinancials(BaseModel):
    ggr: float
    total_bets: float
    total_wins: float
    rtp: float

class DashboardPlayerStats(BaseModel):
    active: int

class DashboardTimeSeriesPoint(BaseModel):
    date: date
    ggr: float

class TenantOverviewResponse(BaseModel):
    financials: DashboardFinancials
    players: DashboardPlayerStats
    timeseries: List[DashboardTimeSeriesPoint]

    class Config:
        from_attributes = True


#live dashboard schemas
class RealtimeKPIs(BaseModel):
    # Today's Stats
    total_bets: float
    total_wins: float
    ggr: float
    actual_rtp: float
    active_sessions: int
    new_registrations_today: int
    total_raffle_sales_today: float
    
    # Strategic Audit (Assignment Task 3)
    stale_withdrawals_count: int      # Task 3g
    player_ltv_total: float           # Task 3b (Deposits - Withdrawals)
    inactive_players_30d: int         # Task 3e
    bonus_utilization_rate: float     # Task 3f
    active_bonuses_value: float = 0.0

class LiveGamePerformance(BaseModel):
    game_id: Optional[UUID] = None
    game_name: str
    bets_today: float
    wins_today: float
    ggr_today: float
    rtp_today: float
    unique_players: int

class AdminRealtimeDashboardResponse(BaseModel):
    kpis: RealtimeKPIs
    top_games: List[LiveGamePerformance]
    currency_symbol: str = "₹"
    updated_at: datetime

    class Config:
        from_attributes = True