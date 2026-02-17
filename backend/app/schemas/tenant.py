from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class TenantResponse(BaseModel):
    tenant_id: UUID
    tenant_name: str
    domain: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
