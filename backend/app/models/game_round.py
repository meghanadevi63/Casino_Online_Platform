from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid
from sqlalchemy.sql import func

class GameRound(Base):
    __tablename__ = "game_rounds"

    round_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )

    session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.session_id"), nullable=False)

    round_number = Column(Integer, nullable=False)
    outcome = Column(String(50))

    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))