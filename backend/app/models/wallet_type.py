from sqlalchemy import Column, Integer, String
from app.core.database import Base

class WalletType(Base):
    __tablename__ = "wallet_types"

    wallet_type_id = Column(Integer, primary_key=True)
    wallet_type_code = Column(String(20), unique=True, nullable=False)
    description = Column(String)
