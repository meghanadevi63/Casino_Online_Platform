from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.admin.player_summary import PlayerSummaryResponse
from app.schemas.admin_players import (
    AdminPlayerListResponse,
    AdminPlayerDetailResponse,
    UpdatePlayerStatusRequest
)
from app.services.admin_players_service import (
    admin_only,
    list_players,
    get_player,
    update_player_status,
    get_player_summary
)

router = APIRouter(
    prefix="/admin/players",
    tags=["Admin Players"]
)



@router.get("", response_model=list[AdminPlayerListResponse])
def list_all_players(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_only(db, current_user)

    rows = list_players(db, current_user.tenant_id)

    return [
        {
            "player_id": player.player_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "status": player.status,
            "kyc_status": player.kyc_status,
            "created_at": user.created_at,
            "last_login_at": player.last_login_at
        }
        for player, user in rows
    ]


@router.get("/{player_id}", response_model=AdminPlayerDetailResponse)
def get_single_player(
    player_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_only(db, current_user)

    player, user = get_player(db, current_user.tenant_id, player_id)

    return {
        "player_id": player.player_id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "status": player.status,
        "kyc_status": player.kyc_status,
        "country_code": user.country_code,
        "created_at": user.created_at,
        "last_login_at": player.last_login_at
    }


@router.patch("/{player_id}/status")
def update_status(
    player_id: UUID,
    data: UpdatePlayerStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_only(db, current_user)

    update_player_status(
        db,
        current_user.tenant_id,
        player_id,
        data.status
    )

    return {"message": "Player status updated successfully"}

@router.get(
    "/{player_id}/summary",
    response_model=PlayerSummaryResponse
)
def get_player_summary_api(
    player_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_only(db, current_user)
    return get_player_summary(
        db,
        current_user.tenant_id,
        player_id
    )
