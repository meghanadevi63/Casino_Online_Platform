from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class PaymentGateway(Base):
    __tablename__ = "payment_gateways"

    gateway_id = Column(Integer, primary_key=True)
    gateway_name = Column(String(100), unique=True, nullable=False)
    gateway_type = Column(String(30))
    provider = Column(String(100))
    is_active = Column(Boolean, default=True)
    
   
    created_at = Column(DateTime(timezone=True), server_default=func.now())