from pydantic import BaseModel

class CountryResponse(BaseModel):
    country_code: str
    country_name: str
    default_timezone: str
    default_currency: str

    class Config:
        from_attributes = True
