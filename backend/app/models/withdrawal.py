import uuid
from sqlalchemy import Column, Numeric, String, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Withdrawal(Base):
    __tablename__ = "withdrawals"

    withdrawal_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.wallet_id"), nullable=False)
    currency_id = Column(ForeignKey("currencies.currency_id"), nullable=False)

    amount = Column(Numeric(18, 2), nullable=False)

    status = Column(String(20), default="requested")

   
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
    processed_at = Column(DateTime(timezone=True))

    gateway_id = Column(Integer, ForeignKey("payment_gateways.gateway_id"))
    gateway_reference = Column(String(255))
    rejection_reason = Column(String)