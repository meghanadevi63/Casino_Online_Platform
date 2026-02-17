from sqlalchemy.orm import Session
from fastapi import HTTPException

from datetime import datetime, timezone
from app.core.audit import log_audit
from app.models.game import Game
from app.models.game_provider import GameProvider
from app.models.game_category import GameCategory

def list_games(db: Session):
    return (
        db.query(Game)
        .order_by(Game.created_at.desc())
        .all()
    )


def create_game(db: Session, data, actor_user):
    
    if data.min_bet >= data.max_bet:
        raise HTTPException(
            status_code=400,
            detail="min_bet must be less than max_bet"
        )
    
    # Validate provider
    provider = (
        db.query(GameProvider)
        .filter(GameProvider.provider_id == data.provider_id)
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Game provider not found")

    # Validate category
    category = (
        db.query(GameCategory)
        .filter(GameCategory.category_id == data.category_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Game category not found")

    # Unique game_code
    existing = (
        db.query(Game)
        .filter(Game.game_code == data.game_code)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Game code already exists")

    game = Game(
        provider_id=data.provider_id,
        category_id=data.category_id,
        game_name=data.game_name,
        game_code=data.game_code,
        min_bet=data.min_bet,
        max_bet=data.max_bet,
        rtp_percentage=data.rtp_percentage,
        is_active=True,
       
    )

    db.add(game)
    db.commit()
    db.refresh(game)
    
    # AUDIT LOG
    log_audit(
        db=db,
        actor_user=actor_user,
        action="GAME_CREATED",
        entity_type="game",
        entity_id=game.game_id,
        new_data={
            "game_name": game.game_name,
            "game_code": game.game_code,
            "provider_id": game.provider_id,
            "category_id": game.category_id,
            "min_bet": str(game.min_bet),
            "max_bet": str(game.max_bet),
            "rtp_percentage": str(game.rtp_percentage),
            "is_active": game.is_active
        }
    )

    return game