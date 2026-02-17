from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class ProviderGameResponse(BaseModel):
    game_id: UUID
    game_name: str
    game_code: str
    category_id: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
