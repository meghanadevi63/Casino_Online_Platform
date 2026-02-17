from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class AdminPlayerListResponse(BaseModel):
    player_id: UUID
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    status: str
    kyc_status: str
    created_at: datetime
    last_login_at: Optional[datetime]

    class Config:
        from_attributes = True


class AdminPlayerDetailResponse(AdminPlayerListResponse):
    country_code: Optional[str]


class UpdatePlayerStatusRequest(BaseModel):
    status: str
