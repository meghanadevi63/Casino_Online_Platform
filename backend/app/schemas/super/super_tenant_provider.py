from pydantic import BaseModel
from datetime import date
from typing import Optional


class TenantProviderCreate(BaseModel):
    provider_id: int
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    is_active: bool = True


class TenantProviderUpdate(BaseModel):
    is_active: Optional[bool] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None


class TenantProviderResponse(BaseModel):
    provider_id: int
    provider_name: str
    is_active: bool
    contract_start: Optional[date]
    contract_end: Optional[date]

    class Config:
        from_attributes = True
