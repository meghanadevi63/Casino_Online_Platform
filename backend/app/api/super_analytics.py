from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date 

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.super_analytics_service import (
    get_platform_overview,
    get_tenant_analytics,
    get_game_analytics
)
from app.schemas.super_analytics import (
    PlatformOverviewResponse,
    SuperTenantAnalyticsResponse,
    SuperGameAnalyticsResponse
)

router = APIRouter(
    prefix="/super/analytics",
    tags=["Super Admin Analytics"]
)


def super_admin_only(user):
    """
    Role check: Only role_id 4 (SUPER_ADMIN) can access platform-wide analytics.
    """
    if user.role_id != 4:
        raise HTTPException(status_code=403, detail="Super admin access required")


@router.get("/overview", response_model=PlatformOverviewResponse)
def platform_overview(
    range: int | None = Query(None, ge=1, le=365),
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Aggregated platform metrics (Total Bets, GGR, RTP) for all tenants.
    Ranges like 'Last 30 Days' are resolved using UTC in the service layer.
    """
    super_admin_only(current_user)

    return get_platform_overview(
        db=db,
        range_days=range,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/tenants", response_model=list[SuperTenantAnalyticsResponse])
def tenants_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Breakdown of performance metrics per individual tenant.
    """
    super_admin_only(current_user)
    return get_tenant_analytics(db)


@router.get("/games", response_model=list[SuperGameAnalyticsResponse])
def games_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Breakdown of performance metrics per game across all tenants.
    """
    super_admin_only(current_user)
    return get_game_analytics(db)