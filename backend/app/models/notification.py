import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    # Unique identifier for each notification
    notification_id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )

    # Reference to the player/user receiving the notification
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.user_id", ondelete="CASCADE"), 
        nullable=False
    )

    # Short heading for the alert
    title = Column(String(100), nullable=False)

    # Detailed content of the notification
    message = Column(Text, nullable=False)

    # Category for styling/filtering: 'KYC', 'WITHDRAWAL', 'DEPOSIT', 'PROMO'
    type = Column(String(30)) 

    # Read/Unread status tracker
    is_read = Column(Boolean, default=False)

    
    created_at = Column(DateTime(timezone=True), server_default=func.now())