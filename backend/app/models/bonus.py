import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Bonus(Base):
    __tablename__ = "bonuses"

    bonus_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)
    
    bonus_name = Column(String(100), nullable=False)
    bonus_type = Column(String(30), nullable=False) # e.g., 'POST_WAGER_REWARD'
    
    bonus_amount = Column(Numeric(18, 2), nullable=False) # The reward amount
    wagering_multiplier = Column(Integer, nullable=False) # e.g., 10x
    
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_to = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
   
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())