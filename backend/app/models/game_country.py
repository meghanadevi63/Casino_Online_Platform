from sqlalchemy import Column, Boolean, DateTime, ForeignKey, CHAR
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class GameCountry(Base):
    __tablename__ = "game_countries"

    game_id = Column(
        UUID(as_uuid=True),
        ForeignKey("games.game_id"),
        primary_key=True
    )

    country_code = Column(
        CHAR(2),
        ForeignKey("countries.country_code"),
        primary_key=True
    )

    is_allowed = Column(Boolean, default=True)
    
   
    created_at = Column(DateTime(timezone=True), server_default=func.now())