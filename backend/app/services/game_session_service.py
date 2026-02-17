from datetime import datetime, timezone 
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.game_session import GameSession
from app.models.game import Game
from app.models.tenant_game import TenantGame
from app.models.player import Player 

def start_game_session(
    db: Session,
    player_id,
    tenant_id,
    game_id
):
    # 1. LOCK the player row to prevent parallel session creation
    db.query(Player).filter(Player.player_id == player_id).with_for_update().first()

    # 2. Validate tenant has access to the game
    tenant_game = (
        db.query(TenantGame)
        .join(Game, Game.game_id == TenantGame.game_id)
        .filter(
            TenantGame.tenant_id == tenant_id,
            TenantGame.game_id == game_id,
            TenantGame.is_active.is_(True),
            Game.is_active.is_(True)
        )
        .first()
    )

    if not tenant_game:
        raise HTTPException(
            status_code=403,
            detail="Game is not enabled for this tenant"
        )

    # 3. Check existing active session
    existing_session = (
        db.query(GameSession)
        .filter(
            GameSession.player_id == player_id,
            GameSession.tenant_id == tenant_id,
            GameSession.game_id == game_id,
            GameSession.status == "active"
        )
        .first()
    )

    if existing_session:
        return {
            "session_id": existing_session.session_id,
            "status": existing_session.status
        }

    # 4. Create new session
    session = GameSession(
        player_id=player_id,
        tenant_id=tenant_id,
        game_id=game_id,
        status="active",
       
        started_at=datetime.now(timezone.utc)
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.session_id,
        "status": session.status
    }

def end_game_session(db: Session, player_id, session_id):
    session = (
        db.query(GameSession)
        .filter(
            GameSession.session_id == session_id,
            GameSession.player_id == player_id
        )
        .first()
    )

    if not session:
        return {"session_id": session_id, "status": "completed"}

    if session.status == "active":
        session.status = "completed"
       
        session.ended_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)

    return {
        "session_id": session.session_id,
        "status": session.status
    }