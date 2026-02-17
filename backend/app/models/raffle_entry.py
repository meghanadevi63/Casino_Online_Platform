import uuid
from sqlalchemy import Column, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class RaffleEntry(Base):
    __tablename__ = "raffle_entries"

    entry_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jackpot_id = Column(UUID(as_uuid=True), ForeignKey("raffle_jackpots.jackpot_id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.wallet_id"), nullable=False)
    amount_paid = Column(Numeric(18, 2), nullable=False)
    
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('jackpot_id', 'player_id', name='uq_jackpot_player_entry'),
    )