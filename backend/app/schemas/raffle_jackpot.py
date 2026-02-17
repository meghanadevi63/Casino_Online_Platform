from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Literal

class JackpotCreate(BaseModel):
    name: str
    description: Optional[str] = None
    currency_id: int
    jackpot_type: Literal["MANUAL", "TIME_BASED", "THRESHOLD"]
    seed_amount: float = 0
    entry_fee: float = 0
    draw_at: Optional[datetime] = None
    target_amount: Optional[float] = None

class JackpotResponse(BaseModel):
    jackpot_id: UUID
    name: str
    description: Optional[str]
    jackpot_type: str
    seed_amount: float
    current_amount: float
    entry_fee: float
    status: str
    currency_id: int
    currency_symbol: str = "₹" 
    draw_at: Optional[datetime]
    target_amount: Optional[float]
    winner_id: Optional[UUID]

    winner_name: Optional[str] = None
    winner_email: Optional[str] = None
    participants_count: int = 0

    won_amount: Optional[float]
    drawn_at: Optional[datetime]
    created_at: datetime
    is_joined: bool = False 
    class Config:
        from_attributes = True

class JackpotJoinResponse(BaseModel):
    message: str
    jackpot_id: UUID
    new_balance: float

class JackpotDrawResponse(BaseModel):
    jackpot_id: UUID
    winner_id: UUID
    winner_name: str 
    winner_email: str 
    amount_won: float
    currency_symbol: str

class TenantCurrencyResponse(BaseModel):
    currency_id: int
    currency_code: str