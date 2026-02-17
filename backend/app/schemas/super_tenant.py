from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Literal


class SuperTenantCreateRequest(BaseModel):
    tenant_name: str
    domain: Optional[str]


class SuperTenantUpdateRequest(BaseModel):
    status: Optional[Literal["active", "suspended", "inactive"]]
    domain: Optional[str]


class SuperTenantResponse(BaseModel):
    tenant_id: UUID
    tenant_name: str
    domain: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
