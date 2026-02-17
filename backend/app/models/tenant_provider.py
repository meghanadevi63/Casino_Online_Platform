from sqlalchemy import Column, Boolean, Date, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class TenantProvider(Base):
    __tablename__ = "tenant_providers"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), primary_key=True)
    
    
    provider_id = Column(Integer, ForeignKey("game_providers.provider_id"), primary_key=True)

    is_active = Column(Boolean, default=True)
    
   
    contract_start = Column(Date)
    contract_end = Column(Date)