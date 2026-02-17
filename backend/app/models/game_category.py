from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class GameCategory(Base):
    __tablename__ = "game_categories"

    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
