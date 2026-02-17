import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_tenant_email"),
    )

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    role_id = Column(ForeignKey("roles.role_id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)
    country_code = Column(String(2), ForeignKey("countries.country_code"))

    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(255), nullable=False)
    password_hash = Column(String, nullable=False)

    status = Column(String(20), default="active")

   
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())