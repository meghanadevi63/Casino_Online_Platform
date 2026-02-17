import uuid
from sqlalchemy import Column, Integer, Boolean, Numeric, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship
from app.models.wallet_type import WalletType

class Wallet(Base):
    __tablename__ = "wallets"

    wallet_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"))
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"))
    currency_id = Column(Integer, ForeignKey("currencies.currency_id"))
    wallet_type_id = Column(Integer, ForeignKey("wallet_types.wallet_type_id"))

    balance = Column(Numeric(18, 2), default=0)
    is_active = Column(Boolean, default=True)

  
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    wallet_type = relationship(WalletType)