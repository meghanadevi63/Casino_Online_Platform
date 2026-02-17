from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.game_session_service import (
    start_game_session,
    end_game_session
)
from app.schemas.games.even_odd import StartSessionResponse

router = APIRouter(
    prefix="/games",
    tags=["Game Sessions"]
)


@router.post(
    "/{game_id}/session/start",
    response_model=StartSessionResponse,
    summary="Start Game Session",
    description="Starts a game session only if the game is enabled for the tenant"
)
def start_session(
    game_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Tenant not resolved for current user"
        )

    return start_game_session(
        db=db,
        player_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        game_id=game_id
    )


@router.post(
    "/sessions/{session_id}/end",
    response_model=StartSessionResponse,
    summary="End Game Session",
    description="Ends an active game session for the current player"
)
def end_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return end_game_session(
        db=db,
        player_id=current_user.user_id,
        session_id=session_id
    )
