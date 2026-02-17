from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import date, datetime

class TenantGameCreate(BaseModel):
    game_id: UUID
    is_active: bool = True
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    min_bet_override: Optional[float] = None
    max_bet_override: Optional[float] = None
    rtp_override: Optional[float] = None

class TenantGameUpdate(BaseModel):
    is_active: Optional[bool] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    min_bet_override: Optional[float] = None
    max_bet_override: Optional[float] = None
    rtp_override: Optional[float] = None

class TenantGameResponse(BaseModel):
    tenant_id: UUID
    game_id: UUID
    
    
    game_name: str
    provider_name: str
    
    is_active: bool
    contract_start: Optional[date]
    contract_end: Optional[date]
    min_bet_override: Optional[float]
    max_bet_override: Optional[float]
    rtp_override: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True