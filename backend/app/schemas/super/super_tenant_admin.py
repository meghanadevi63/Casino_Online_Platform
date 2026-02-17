from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class TenantAdminCreate(BaseModel):
    email: EmailStr
    password: str
    country_code: str 
    first_name: str | None = None
    last_name: str | None = None


class TenantAdminResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    country_code: str 
    first_name: str | None
    last_name: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TenantStatusUpdate(BaseModel):
    status: str  # active | suspended | inactive


class TenantOverviewResponse(BaseModel):
    tenant_id: UUID
    tenant_name: str
    status: str
    created_at: datetime

    total_players: int
    active_players: int
    total_games: int
    total_providers: int