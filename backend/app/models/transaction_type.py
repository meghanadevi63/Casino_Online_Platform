from sqlalchemy import Column, Integer, String
from app.core.database import Base

class TransactionType(Base):
    __tablename__ = "transaction_types"

    transaction_type_id = Column(Integer, primary_key=True)
    transaction_code = Column(String(30), unique=True, nullable=False)
    description = Column(String)
