from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Currency(Base):
    __tablename__ = "currencies"

    currency_id = Column(Integer, primary_key=True, index=True)
    currency_code = Column(String(3), unique=True, nullable=False)
    currency_name = Column(String(50), nullable=False)
    symbol = Column(String(5))
    decimal_places = Column(Integer, default=2)
