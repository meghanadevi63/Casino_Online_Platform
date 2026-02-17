from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Player(Base):
    __tablename__ = "players"

    player_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), primary_key=True)

    status = Column(String(20), default="active")
    kyc_status = Column(String(20), default="not_submitted")
    
    # MODIFIED: Added timezone=True
    kyc_verified_at = Column(DateTime(timezone=True))
    last_login_at = Column(DateTime(timezone=True))

    # MODIFIED: Added timezone=True
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())