from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.games.history_service import (
    get_player_sessions,
    get_session_rounds,
    get_session_bets
)
from app.schemas.games.history import GameSessionHistoryResponse

router = APIRouter(
    prefix="/games/history",
    tags=["Player Game History"]
)


@router.get(
    "/sessions",
    response_model=list[GameSessionHistoryResponse]
)
def get_my_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_player_sessions(
        db=db,
        player_id=current_user.user_id
    )


@router.get("/sessions/{session_id}")
def session_rounds(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return get_session_rounds(db, session_id, current_user.user_id)


@router.get("/sessions/{session_id}/bets")
def session_bets(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return get_session_bets(db, session_id, current_user.user_id)
