from typing import Optional
from pydantic import BaseModel


class CountryMeta(BaseModel):
    country_code: str
    country_name: str
    default_currency: Optional[str]
    class Config:
        from_attributes = True


class CurrencyMeta(BaseModel):
    currency_id: int
    currency_code: str
    currency_name: str
    symbol: str | None

    class Config:
        from_attributes = True


class GameCategoryMeta(BaseModel):
    category_id: int
    category_name: str

    class Config:
        from_attributes = True


class RoleMeta(BaseModel):
    role_id: int
    role_name: str

    class Config:
        from_attributes = True
