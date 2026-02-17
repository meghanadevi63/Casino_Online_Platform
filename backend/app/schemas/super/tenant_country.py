from pydantic import BaseModel
from typing import Optional

class TenantCountryCreate(BaseModel):
    country_code: str
    currency_code: str

class TenantCountryUpdate(BaseModel):
    is_active: bool

class TenantCountryResponse(BaseModel):
    country_code: str
    country_name: str
    currency_code: str
    is_active: bool

    class Config:
        from_attributes = True
