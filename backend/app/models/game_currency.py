from sqlalchemy import Column, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy import DateTime, Integer

from app.core.database import Base


class GameCurrency(Base):
    __tablename__ = "game_currencies"

    game_id = Column(
        UUID(as_uuid=True),
        ForeignKey("games.game_id"),
        primary_key=True
    )

    currency_id = Column(
        Integer,
        ForeignKey("currencies.currency_id"),
        primary_key=True
    )

    is_allowed = Column(Boolean, default=True)