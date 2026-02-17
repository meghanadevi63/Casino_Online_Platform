from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import date

class MarketplaceGameResponse(BaseModel):
    game_id: UUID
    game_name: str
    game_code: str
    provider_name: str
    provider_id: int  
    rtp: Optional[float]
    status: str  # ENABLED, AVAILABLE, LOCKED
    
    class Config:
        from_attributes = True

class AddGameRequest(BaseModel):
    game_id: UUID
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    min_bet_override: Optional[float] = None
    max_bet_override: Optional[float] = None
    rtp_override: Optional[float] = None


class RequestAccessPayload(BaseModel):
    provider_id: int 
    proposed_start_date: Optional[date] = None

class RejectRequestPayload(BaseModel):
    admin_notes: str
