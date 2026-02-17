from sqlalchemy import Column, Boolean, Date, Numeric, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class TenantGame(Base):
    __tablename__ = "tenant_games"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), primary_key=True)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.game_id"), primary_key=True)

    is_active = Column(Boolean, default=True)

    # Date remains as is (represents a calendar day)
    contract_start = Column(Date)
    contract_end = Column(Date)

    min_bet_override = Column(Numeric(12, 2))
    max_bet_override = Column(Numeric(12, 2))
    rtp_override = Column(Numeric(5, 2))

    
    created_at = Column(DateTime(timezone=True), server_default=func.now())