from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.kyc import AdminKYCActionRequest, AdminKYCListResponse, AdminKYCHistoryResponse
from app.services.admin_kyc_service import (
    admin_process_kyc,
    get_kyc_history,
    list_pending_kyc,
    get_kyc_document
)
from app.models.user import User

router = APIRouter(prefix="/admin/kyc", tags=["Admin KYC"])


#  LIST PENDING KYC (TENANT-SCOPED)
@router.get("/pending", response_model=list[AdminKYCListResponse])
def get_pending_kyc(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role_id not in (2, 4):
        raise HTTPException(status_code=403, detail="Admin access required")

    return list_pending_kyc(db, current_user.tenant_id)


#  VIEW SINGLE KYC DOCUMENT
@router.get("/{document_id}")
def get_single_kyc(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role_id not in (2, 4):
        raise HTTPException(status_code=403, detail="Admin access required")

    return get_kyc_document(
        db,
        document_id=document_id,
        tenant_id=current_user.tenant_id
    )


#  APPROVE / REJECT
@router.post("/{document_id}/action")
def process_kyc(
    document_id: int,
    data: AdminKYCActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role_id not in (2, 4):
        raise HTTPException(status_code=403, detail="Admin access required")

    return admin_process_kyc(
        db=db,
        document_id=document_id,
        action=data.action,
        admin_user_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        rejection_reason=data.rejection_reason
    )


@router.get(
    "/history/{user_id}",
    response_model=list[AdminKYCHistoryResponse]
)
def get_player_kyc_history(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    #  Admin only
    if current_user.role_id not in (2, 4):
        raise HTTPException(status_code=403, detail="Admin access required")

    #  Tenant safety
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.tenant_id == current_user.tenant_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in your tenant"
        )

    return get_kyc_history(
        db=db,
        user_id=user_id,
        tenant_id=current_user.tenant_id
    )
