from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date 
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.admin_timeseries import GameTimeSeriesResponse
from app.services.admin_timeseries_service import (
    get_games_timeseries,
    get_single_game_timeseries
)

router = APIRouter(
    prefix="/admin/analytics/timeseries",
    tags=["Admin Analytics – Time Series"]
)


def admin_only(user):
    # role_id 2 = TENANT_ADMIN, 4 = SUPER_ADMIN
    if user.role_id not in (2, 4):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )


# ALL GAMES – TIME SERIES

@router.get(
    "/games",
    response_model=List[GameTimeSeriesResponse]
)
def games_timeseries(
    range: int | None = Query(None, ge=1, le=365),
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    admin_only(current_user)

    # Validation: Ensure parameters are not ambiguous
    if range and (start_date or end_date):
        raise HTTPException(
            status_code=400,
            detail="Provide either range OR start_date & end_date, not both"
        )

    if not range and not (start_date and end_date):
        raise HTTPException(
            status_code=400,
            detail="Provide range or both start_date and end_date"
        )

    return get_games_timeseries(
        db=db,
        tenant_id=current_user.tenant_id,
        range_days=range,
        start_date=start_date,
        end_date=end_date
    )



# SINGLE GAME – TIME SERIES

@router.get(
    "/games/{game_id}",
    response_model=List[GameTimeSeriesResponse]
)
def single_game_timeseries(
    game_id: str,
    range: int | None = Query(None, ge=1, le=365),
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    admin_only(current_user)

    # Validation: Ensure parameters are not ambiguous
    if range and (start_date or end_date):
        raise HTTPException(
            status_code=400,
            detail="Provide either range OR start_date & end_date, not both"
        )

    if not range and not (start_date and end_date):
        raise HTTPException(
            status_code=400,
            detail="Provide range or both start_date and end_date"
        )

    return get_single_game_timeseries(
        db=db,
        tenant_id=current_user.tenant_id,
        game_id=game_id,
        range_days=range,
        start_date=start_date,
        end_date=end_date
    )