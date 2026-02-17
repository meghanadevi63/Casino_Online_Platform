from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.game import Game
from app.models.game_provider import GameProvider


def get_provider_games(db: Session, provider_id: int):
    provider = (
        db.query(GameProvider)
        .filter(GameProvider.provider_id == provider_id)
        .first()
    )

    if not provider:
        raise HTTPException(404, "Provider not found")

    games = (
        db.query(Game)
        .filter(Game.provider_id == provider_id)
        .order_by(Game.created_at.desc())
        .all()
    )

    return games
