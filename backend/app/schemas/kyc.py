from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

from uuid import UUID

class KYCUploadRequest(BaseModel):
    document_type: Literal[
        "AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENSE"
    ]
    document_number: Optional[str] = Field(
        None, example="1234-5678-9012"
    )
    file_path: str = Field(
        ..., example="/uploads/kyc/aadhaar_123.pdf"
    )


class AdminKYCActionRequest(BaseModel):
    action: Literal["approve", "reject"]
    rejection_reason: Optional[str] = Field(
        None,
        description="Required when action = reject"
    )


class AdminKYCListResponse(BaseModel):
    document_id: int
    user_id: UUID
    email: str
    document_type: str
    document_number: str | None
    file_url: str
    verification_status: str   
    uploaded_at: datetime

    class Config:
        from_attributes = True



 



class AdminKYCHistoryResponse(BaseModel):
    document_id: int
    document_type: str
    document_number: Optional[str]

    file_url: str

    verification_status: str
    rejection_reason: Optional[str]

    verified_by_email: Optional[str]
    verified_at: Optional[datetime]

    uploaded_at: datetime

    class Config:
        from_attributes = True
