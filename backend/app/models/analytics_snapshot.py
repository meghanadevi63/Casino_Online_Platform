from sqlalchemy import Column, Integer, Numeric, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    snapshot_id = Column(Integer, primary_key=True)

    snapshot_date = Column(Date, nullable=False)

    tenant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tenants.tenant_id"),
        nullable=False
    )

    country_code = Column(
        ForeignKey("countries.country_code"),
        nullable=True
    )

    game_id = Column(
        UUID(as_uuid=True),
        ForeignKey("games.game_id"),
        nullable=True
    )

    total_bets = Column(Numeric(18, 2), default=0)
    total_wins = Column(Numeric(18, 2), default=0)

    ggr = Column(Numeric(18, 2), default=0)
    ngr = Column(Numeric(18, 2), nullable=True)

    total_bonus_issued = Column(Numeric(18, 2), nullable=True)
    total_bonus_converted = Column(Numeric(18, 2), nullable=True)

    rtp_percentage = Column(Numeric(5, 2), nullable=True)

    total_players = Column(Integer, default=0)
    active_players = Column(Integer, default=0)

    # Standardized: Matches your TIMESTAMPTZ database migration
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "snapshot_date",
            "tenant_id",
            "country_code",
            "game_id",
            name="uq_snapshot_date_tenant_country_game"
        ),
    )