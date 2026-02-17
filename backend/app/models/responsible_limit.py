from sqlalchemy import Column, Numeric, Date, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime, timezone
from app.core.database import Base


class ResponsibleLimit(Base):
    __tablename__ = "responsible_limits"

    limit_id = Column(Integer, primary_key=True, index=True)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False, unique=True)

    daily_deposit_limit = Column(Numeric(14, 2))
    daily_bet_limit = Column(Numeric(14, 2))
    monthly_bet_limit = Column(Numeric(14, 2))

    
    self_exclusion_until = Column(Date)

   
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc)
    )