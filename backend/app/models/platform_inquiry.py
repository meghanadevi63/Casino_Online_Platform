import uuid
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class PlatformInquiry(Base):
    __tablename__ = "platform_inquiries"

    inquiry_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    company_name = Column(String(150))
    message = Column(Text)
    status = Column(String(20), default='new') # new, contacted, closed
    
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())