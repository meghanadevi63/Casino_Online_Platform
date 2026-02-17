from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.super.super_audit_log import AuditLogResponse
from app.services.super.audit_log_service import get_audit_logs

router = APIRouter(
    prefix="/super/audit-logs",
    tags=["Super Admin - Audit Logs"]
)


def super_admin_only(user: User):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")


@router.get(
    "",
    response_model=List[AuditLogResponse]
)
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    tenant_id=None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    return get_audit_logs(db, limit=limit, tenant_id=tenant_id)
