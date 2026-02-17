from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing  import Literal
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.kyc_service import upload_kyc_document

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.post("/upload")
def upload_kyc(
    document_type: Literal[
        "AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENSE"
    ] = Form(...),
    document_number: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return upload_kyc_document(
        db=db,
        player_id=current_user.user_id,
        document_type=document_type,
        document_number=document_number,
        file=file
    )