from pydantic import BaseModel

class AddTenantCountryCurrencyRequest(BaseModel):
    currency_id: int
    is_default: bool = False


class TenantCountryCurrencyResponse(BaseModel):
    currency_id: int
    currency_code: str
    currency_name: str
    is_default: bool
    is_active: bool

    class Config:
        from_attributes = True
