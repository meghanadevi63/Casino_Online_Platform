from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    company_name: str
    message: str

class InquiryUpdate(BaseModel):
    status: str # 'new', 'contacted', 'closed'

class InquiryResponse(BaseModel):
    inquiry_id: UUID
    name: str
    email: str
    company_name: Optional[str]
    message: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True