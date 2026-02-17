from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class GameSession(Base):
    __tablename__ = "game_sessions"

    session_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )

    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.game_id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)

    status = Column(String(20), default="active")

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))

    ip_address = Column(String(45))
    device_info = Column(String)