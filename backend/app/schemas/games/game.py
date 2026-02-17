from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class GameListResponse(BaseModel):
    game_id: UUID
    game_name: str
    game_code: str
    category: Optional[str]
    min_bet: float
    max_bet: float
    is_active: bool

    class Config:
        from_attributes = True
