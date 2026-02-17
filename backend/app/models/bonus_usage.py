import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base

class BonusUsage(Base):
    __tablename__ = "bonus_usage"

    bonus_usage_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bonus_id = Column(UUID(as_uuid=True), ForeignKey("bonuses.bonus_id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False)
    
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.wallet_id"), nullable=False)
    
    bonus_amount = Column(Numeric(18, 2), nullable=False)
    wagering_required = Column(Numeric(18, 2), nullable=False)
    wagering_completed = Column(Numeric(18, 2), default=0)
    
    # status: 'active', 'claimable', 'completed', 'expired', 'cancelled'
    status = Column(String(20), default='active', nullable=False)
    
   
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
   
    expired_at = Column(DateTime(timezone=True), nullable=True)