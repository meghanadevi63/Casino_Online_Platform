from sqlalchemy import Column, Boolean, ForeignKey, CHAR, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class TenantCountryCurrency(Base):
    __tablename__ = "tenant_country_currencies"

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

    currency_id = Column(
        Integer,
        ForeignKey("currencies.currency_id"),
        primary_key=True
    )

    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
