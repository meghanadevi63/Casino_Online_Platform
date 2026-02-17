import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class RaffleJackpot(Base):
    __tablename__ = "raffle_jackpots"

    jackpot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)
    currency_id = Column(Integer, ForeignKey("currencies.currency_id"), nullable=False)
    
    name = Column(String(100), nullable=False)
    description = Column(String)
    
    # MANUAL, TIME_BASED, THRESHOLD
    jackpot_type = Column(String(20), nullable=False)
    
    seed_amount = Column(Numeric(18, 2), default=0)
    current_amount = Column(Numeric(18, 2), default=0)
    entry_fee = Column(Numeric(18, 2), default=0)
    
    # Config
    # MODIFIED: Added timezone=True
    draw_at = Column(DateTime(timezone=True))      # For TIME_BASED
    
    target_amount = Column(Numeric(18, 2)) # For THRESHOLD
    
    # active, completed, cancelled
    status = Column(String(20), default="active")
    
    winner_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"))
    won_amount = Column(Numeric(18, 2))
    
    # MODIFIED: Added timezone=True
    drawn_at = Column(DateTime(timezone=True))
    
    # MODIFIED: Added timezone=True
    created_at = Column(DateTime(timezone=True), server_default=func.now())