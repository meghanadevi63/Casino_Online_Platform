from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date 

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.super_timeseries import SuperTimeSeriesResponse
from app.services.super_timeseries_service import get_platform_timeseries

router = APIRouter(
    prefix="/super/analytics",
    tags=["Super Admin Analytics – Time Series"]
)


def super_admin_only(user):
    # role_id 4 = SUPER_ADMIN
    if user.role_id != 4:
        raise HTTPException(status_code=403, detail="Super admin access required")


@router.get(
    "/timeseries",
    response_model=List[SuperTimeSeriesResponse]
)
def platform_timeseries(
    range: int = Query(None, ge=1, le=365),
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Fetches platform-wide financial aggregates over time.
    Logic for 'today' and date ranges is handled in the service using UTC.
    """
    super_admin_only(current_user)

    return get_platform_timeseries(
        db=db,
        range_days=range,
        start_date=start_date,
        end_date=end_date
    )