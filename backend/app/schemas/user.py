from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class MeResponse(BaseModel):
    user_id: UUID
    email: str
    first_name: Optional[str]
    last_name: Optional[str]

    role: str
    role_id: int | None = None

    tenant_id: UUID
    tenant_name: str

    country_code: Optional[str]
    status: str

    kyc_status: Optional[str]
    kyc_rejection_reason: Optional[str]  # ✅ NEW

    currency_code: Optional[str]
    currency_symbol: Optional[str]

    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
