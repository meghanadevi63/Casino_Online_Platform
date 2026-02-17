from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func 
from datetime import datetime, timezone 
import uuid

from app.core.database import Base

class Bet(Base):
    __tablename__ = "bets"

    bet_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    round_id = Column(
        UUID(as_uuid=True),
        ForeignKey("game_rounds.round_id"),
        nullable=False
    )

    wallet_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wallets.wallet_id"),
        nullable=False
    )

    bet_currency_id = Column(
        Integer,
        ForeignKey("currencies.currency_id"),
        nullable=False
    )

    bet_amount = Column(Numeric(18, 2), nullable=False)
    win_amount = Column(Numeric(18, 2), default=0)

    bet_status = Column(String(20), default="placed")

   
    placed_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        default=lambda: datetime.now(timezone.utc) 
    )
    
    
    settled_at = Column(DateTime(timezone=True))