from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base

class KYCDocument(Base):
    __tablename__ = "kyc_documents"

    document_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)

    document_type = Column(String(50), nullable=False)
    document_number = Column(String(100))
    file_path = Column(String(500), nullable=False)

    rejection_reason = Column(Text)
    verification_status = Column(
        String(20),
        default="pending",
        nullable=False
    )

    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    
   
    verified_at = Column(DateTime(timezone=True))
    
    expiry_date = Column(Date)

    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())