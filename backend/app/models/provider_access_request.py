import uuid
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class ProviderAccessRequest(Base):
    __tablename__ = "provider_access_requests"

    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("game_providers.provider_id"), nullable=False)

    status = Column(String(20), default="pending")
    
    proposed_start_date = Column(Date)
    admin_notes = Column(Text)

    
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
    processed_at = Column(DateTime(timezone=True))
    
    processed_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))