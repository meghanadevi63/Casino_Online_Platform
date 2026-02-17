from pydantic import BaseModel
from typing import Optional


class GameCountryResponse(BaseModel):
    country_code: str
    country_name: str
    is_allowed: bool

    class Config:
        from_attributes = True


class GameCountryUpdate(BaseModel):
    is_allowed: bool
