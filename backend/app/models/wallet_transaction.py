import uuid
from sqlalchemy import Column, Numeric, ForeignKey, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    wallet_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wallets.wallet_id"),
        nullable=False
    )

    transaction_type_id = Column(
        ForeignKey("transaction_types.transaction_type_id"),
        nullable=False
    )

    amount = Column(Numeric(18, 2), nullable=False)
    balance_before = Column(Numeric(18, 2), nullable=False)
    balance_after = Column(Numeric(18, 2), nullable=False)

    reference_type = Column(String(30))
    reference_id = Column(UUID(as_uuid=True))

    
    created_at = Column(DateTime(timezone=True), server_default=func.now())