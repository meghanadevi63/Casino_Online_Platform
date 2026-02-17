from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class SuperGameCreate(BaseModel):
    provider_id: int
    category_id: int
    game_name: str
    game_code: str
    min_bet: float
    max_bet: float
    rtp_percentage: Optional[float] = None


class SuperGameResponse(BaseModel):
    game_id: UUID
    game_name: str
    game_code: str

    provider_id: Optional[int]
    category_id: Optional[int]

    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
