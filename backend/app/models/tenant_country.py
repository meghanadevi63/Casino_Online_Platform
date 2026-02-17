from sqlalchemy import Column, Boolean, DateTime, ForeignKey, CHAR
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class TenantCountry(Base):
    __tablename__ = "tenant_countries"

    tenant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tenants.tenant_id"),
        primary_key=True
    )

    country_code = Column(
        CHAR(2),
        ForeignKey("countries.country_code"),
        primary_key=True
    )

    currency_code = Column(CHAR(3), nullable=False)

    is_active = Column(Boolean, default=True)


    created_at = Column(DateTime(timezone=True), server_default=func.now())