from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.responsible_gaming import (
    ResponsibleLimitsRequest,
    ResponsibleLimitsResponse,
    SelfExcludeRequest
)
from app.services.responsible_gaming_service import (
    get_limits,
    set_limits,
    self_exclude
)
from app.schemas.responsible_gaming import ResponsibleLimitsUsageResponse
from app.services.responsible_gaming_service import get_limits_usage

router = APIRouter(
    prefix="/responsible-gaming",
    tags=["Responsible Gaming"]
)


@router.get(
    "/limits",
    response_model=ResponsibleLimitsResponse
)
def get_responsible_limits(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return get_limits(db, current_user.user_id)


@router.post(
    "/limits",
    response_model=ResponsibleLimitsResponse
)
def set_responsible_limits(
    data: ResponsibleLimitsRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return set_limits(db, current_user.user_id, data)


@router.post(
    "/self-exclude",
    response_model=ResponsibleLimitsResponse
)
def self_exclude_player(
    data: SelfExcludeRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return self_exclude(db, current_user.user_id, data.self_exclusion_until)


@router.get(
    "/limits/usage",
    response_model=ResponsibleLimitsUsageResponse
)
def get_responsible_limits_usage(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return get_limits_usage(db, current_user.user_id)