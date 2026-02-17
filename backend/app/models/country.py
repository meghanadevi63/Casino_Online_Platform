from sqlalchemy import Column, String
from app.core.database import Base

class Country(Base):
    __tablename__ = "countries"

    country_code = Column(String(2), primary_key=True)
    country_name = Column(String(100), nullable=False)
    default_timezone = Column(String(50), nullable=False)
    default_currency = Column(String(3), nullable=False)
