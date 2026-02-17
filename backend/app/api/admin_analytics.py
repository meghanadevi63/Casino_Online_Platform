from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from datetime import date, timedelta, datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.admin_analytics import AdminRealtimeDashboardResponse, GameAnalyticsResponse, TenantOverviewResponse
from app.services.admin_analytics_service import (
    get_games_analytics,
    get_single_game_analytics,
    get_games_analytics_by_date_range,
    get_tenant_dashboard_overview,
    get_tenant_realtime_dashboard 
)

router = APIRouter(
    prefix="/admin/analytics",
    tags=["Admin Analytics"]
)


def admin_only(current_user):
    # role_id: 2 = TENANT_ADMIN, 4 = SUPER_ADMIN
    if current_user.role_id not in (2, 4):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )


@router.get(
    "/games",
    response_model=List[GameAnalyticsResponse]
)
def list_games_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    admin_only(current_user)
    return get_games_analytics(db, current_user.tenant_id)


@router.get(
    "/games/range",
    response_model=list[GameAnalyticsResponse]
)
def games_analytics_by_range(
    range: str = "7d",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    admin_only(current_user)

  
    today = datetime.now(timezone.utc).date()

    if range == "7d":
        start_date = today - timedelta(days=6)
    elif range == "30d":
        start_date = today - timedelta(days=29)
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid range. Use 7d or 30d"
        )

    return get_games_analytics_by_date_range(
        db=db,
        tenant_id=current_user.tenant_id,
        start_date=start_date,
        end_date=today
    )

@router.get(
    "/games/custom",
    response_model=list[GameAnalyticsResponse]
)
def games_analytics_custom_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    admin_only(current_user)

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")

    return get_games_analytics_by_date_range(
        db=db,
        tenant_id=current_user.tenant_id,
        start_date=start_date,
        end_date=end_date
    )

@router.get(
    "/games/{game_id}",
    response_model=GameAnalyticsResponse
)
def single_game_analytics(
    game_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    admin_only(current_user)

    data = get_single_game_analytics(
        db,
        current_user.tenant_id,
        game_id
    )

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Game not found"
        )

    return data


@router.get(
    "/overview",
    response_model=TenantOverviewResponse
)
def get_tenant_overview(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    admin_only(current_user)
    return get_tenant_dashboard_overview(db, current_user.tenant_id)

@router.get("/live-dashboard", response_model=AdminRealtimeDashboardResponse)
def get_live_metrics(
    country_code: str = None,  
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    admin_only(current_user)
    
    
    return get_tenant_realtime_dashboard(
        db=db, 
        tenant_id=current_user.tenant_id, 
        country_code=country_code
    )

@router.get("/operating-countries")
def get_tenant_operating_countries(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from app.models.tenant_country import TenantCountry
    from app.models.country import Country

    # Fetch countries linked to this tenant
    rows = db.query(Country.country_name, Country.country_code)\
             .join(TenantCountry, TenantCountry.country_code == Country.country_code)\
             .filter(TenantCountry.tenant_id == current_user.tenant_id)\
             .filter(TenantCountry.is_active == True)\
             .all()

    return [{"label": r.country_name, "value": r.country_code} for r in rows]