from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.wallet import AdminWithdrawalActionRequest
from app.services.admin_withdrawal_service import (
    admin_process_withdrawal, 
    admin_list_withdrawals 
)

router = APIRouter(
    prefix="/admin/withdrawals",
    tags=["Admin Withdrawals"]
)

@router.post("/{withdrawal_id}/action")
def process_withdrawal(
    withdrawal_id: str,
    data: AdminWithdrawalActionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Role enforcement
    if current_user.role_id not in (2, 4):  # TENANT_ADMIN / SUPER_ADMIN
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return admin_process_withdrawal(
        db=db,
        withdrawal_id=withdrawal_id,
        action=data.action,
        admin_user_id=current_user.user_id,
        rejection_reason=data.rejection_reason,
        gateway_reference=data.gateway_reference 
    )


@router.get("")
def list_withdrawals(
    status: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    #  Role enforcement: role_id 2 = TENANT_ADMIN, 4 = SUPER_ADMIN
    if current_user.role_id not in (2, 4):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    # Use the service function
    return admin_list_withdrawals(
        db=db, 
        tenant_id=current_user.tenant_id, 
        status=status
    )
