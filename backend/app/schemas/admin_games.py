from pydantic import BaseModel
from uuid import UUID
from typing import Optional

from datetime import datetime 

class TenantGameListResponse(BaseModel):
    game_id: UUID
    game_name: str
    game_code: str
    provider_name: str
    is_active: bool
    
    
    min_bet: float
    max_bet: float
    rtp: Optional[float]

    
    created_at: datetime
    
    class Config:
        from_attributes = True

class TenantGameUpdate(BaseModel):
    is_active: Optional[bool] = None
    min_bet_override: Optional[float] = None
    max_bet_override: Optional[float] = None