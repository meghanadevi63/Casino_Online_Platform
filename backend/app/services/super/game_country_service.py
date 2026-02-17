from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.game import Game
from app.models.country import Country
from app.models.game_country import GameCountry
from app.core.audit import log_audit

def list_game_countries(db: Session, game_id):
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    countries = db.query(Country).order_by(Country.country_name).all()

    game_country_map = {
        gc.country_code: gc
        for gc in db.query(GameCountry)
        .filter(GameCountry.game_id == game_id)
        .all()
    }

    result = []
    for country in countries:
        gc = game_country_map.get(country.country_code)
        result.append({
            "country_code": country.country_code,
            "country_name": country.country_name,
            "is_allowed": gc.is_allowed if gc else False
        })

    return result


def update_game_country(
    db: Session,
    game_id,
    country_code,
    is_allowed: bool,
    actor_user
):
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    country = (
        db.query(Country)
        .filter(Country.country_code == country_code)
        .first()
    )
    if not country:
        raise HTTPException(404, "Country not found")

    gc = (
        db.query(GameCountry)
        .filter(
            GameCountry.game_id == game_id,
            GameCountry.country_code == country_code
        )
        .first()
    )
    old_data = {
        "game_id": str(game_id),
        "country_code": country_code,
        "is_allowed": gc.is_allowed if gc else False
    }

    if gc:
        gc.is_allowed = is_allowed
    else:
        gc = GameCountry(
            game_id=game_id,
            country_code=country_code,
            is_allowed=is_allowed
        )
        db.add(gc)

    db.commit()
    db.refresh(gc)
    # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="GAME_COUNTRY_UPDATED",
        entity_type="game_country",
        entity_id=None,  # composite key
        tenant_id=None,
        old_data=old_data,
        new_data={
            "game_id": str(game_id),
            "country_code": country_code,
            "is_allowed": gc.is_allowed
        }
    )

    return {
        "game_id": game_id,
        "country_code": country_code,
        "is_allowed": gc.is_allowed
    }
