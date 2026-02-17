from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Any


class AuditLogResponse(BaseModel):
    audit_id: int
    actor_user_id: Optional[UUID]
    actor_role_id: Optional[int]

    action: str
    entity_type: Optional[str]
    entity_id: Optional[UUID]

    tenant_id: Optional[UUID]

    old_data: Optional[Any]
    new_data: Optional[Any]

    ip_address: Optional[str]
    user_agent: Optional[str]

    created_at: datetime

    class Config:
        from_attributes = True
