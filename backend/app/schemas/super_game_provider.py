from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class GameProviderCreate(BaseModel):
    provider_name: str = Field(..., example="NetEnt")
    website: Optional[str] = Field(None, example="https://www.netent.com")


class GameProviderUpdate(BaseModel):
    provider_name: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None


class GameProviderResponse(BaseModel):
    provider_id: int
    provider_name: str
    website: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
