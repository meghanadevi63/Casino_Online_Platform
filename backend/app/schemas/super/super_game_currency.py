from pydantic import BaseModel


class GameCurrencyResponse(BaseModel):
    currency_id: int
    currency_code: str
    currency_name: str
    is_allowed: bool

    class Config:
        from_attributes = True


class GameCurrencyUpdate(BaseModel):
    is_allowed: bool
