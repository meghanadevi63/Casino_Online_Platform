from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from datetime import date 

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.analytics_snapshot_service import generate_daily_snapshot

router = APIRouter(
    prefix="/admin/analytics/snapshot",
    tags=["Admin Analytics - Snapshot"]
)


def admin_only(user):
    
    if user.role_id not in (2, 4):
        raise HTTPException(status_code=403, detail="Admin access required")


@router.post("/run")
def run_snapshot(
    snapshot_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Manually triggers the daily analytics snapshot for a tenant.
    If snapshot_date is null, the service defaults to Today (UTC).
    """
    admin_only(current_user)

    return generate_daily_snapshot(
        db=db,
        tenant_id=current_user.tenant_id,
        snapshot_date=snapshot_date
    )