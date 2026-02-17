from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(Integer, primary_key=True)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    actor_role_id = Column(Integer, ForeignKey("roles.role_id"))

    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(UUID(as_uuid=True))

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"))

    old_data = Column(JSON)
    new_data = Column(JSON)

    ip_address = Column(String(45))
    user_agent = Column(String)

   
    created_at = Column(DateTime(timezone=True), server_default=func.now())