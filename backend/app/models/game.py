from sqlalchemy import Column, String, Boolean, Numeric, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Game(Base):
    __tablename__ = "games"

    game_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    provider_id = Column(Integer, ForeignKey("game_providers.provider_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("game_categories.category_id"), nullable=False)

    game_name = Column(String(150), nullable=False)
    game_code = Column(String(100), nullable=False, unique=True)

    rtp_percentage = Column(Numeric(5, 2))
    volatility = Column(String(20))

    min_bet = Column(Numeric(12, 2), nullable=False)
    max_bet = Column(Numeric(12, 2), nullable=False)

    is_active = Column(Boolean, default=True)

    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())