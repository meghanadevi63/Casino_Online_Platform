from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal

# ADMIN SCHEMAS 
class BonusCreate(BaseModel):
    bonus_name: str
    bonus_type: str = "POST_WAGER_REWARD"
    bonus_amount: Decimal = Field(..., gt=0)
    wagering_multiplier: int = Field(..., gt=0)
    valid_from: datetime
    valid_to: datetime
    is_active: bool = True

    @field_validator('valid_to', 'valid_from', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if v == "" or v is None:
            return None
        return v

class BonusResponse(BaseModel):
    bonus_id: UUID
    tenant_id: UUID
    bonus_name: str
    bonus_type: str
    bonus_amount: float
    wagering_multiplier: int
    valid_from: datetime
    valid_to: datetime
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# PLAYER / USAGE SCHEMAS 
class BonusUsageResponse(BaseModel):
    bonus_usage_id: UUID
    player_email: str 
    player_name: Optional[str]          
    currency_symbol: str 
    bonus_name: str 
    bonus_amount: float
    wagering_required: float
    wagering_completed: float
    status: str
    granted_at: datetime
    expired_at: Optional[datetime]

    class Config:
        from_attributes = True