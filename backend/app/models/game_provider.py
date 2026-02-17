from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class GameProvider(Base):
    __tablename__ = "game_providers"

    provider_id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String(100), nullable=False, unique=True)
    website = Column(String(255))
    is_active = Column(Boolean, default=True)

    
    created_at = Column(DateTime(timezone=True), server_default=func.now())