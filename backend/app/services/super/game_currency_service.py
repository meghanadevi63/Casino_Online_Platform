from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.game import Game
from app.models.currency import Currency
from app.models.game_currency import GameCurrency
from app.core.audit import log_audit

def list_game_currencies(db: Session, game_id):
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    currencies = (
        db.query(Currency)
        .order_by(Currency.currency_code)
        .all()
    )

    game_currency_map = {
        gc.currency_id: gc
        for gc in (
            db.query(GameCurrency)
            .filter(GameCurrency.game_id == game_id)
            .all()
        )
    }

    result = []
    for currency in currencies:
        gc = game_currency_map.get(currency.currency_id)
        result.append({
            "currency_id": currency.currency_id,
            "currency_code": currency.currency_code,
            "currency_name": currency.currency_name,
            "is_allowed": gc.is_allowed if gc else False
        })

    return result


def update_game_currency(
    db: Session,
    game_id,
    currency_id: int,
    is_allowed: bool,
    actor_user
):
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    currency = (
        db.query(Currency)
        .filter(Currency.currency_id == currency_id)
        .first()
    )
    if not currency:
        raise HTTPException(404, "Currency not found")

    gc = (
        db.query(GameCurrency)
        .filter(
            GameCurrency.game_id == game_id,
            GameCurrency.currency_id == currency_id
        )
        .first()
    )

    old_data = {
        "game_id": str(game_id),
        "currency_id": currency_id,
        "is_allowed": gc.is_allowed if gc else False
    }

    if gc:
        gc.is_allowed = is_allowed
    else:
        gc = GameCurrency(
            game_id=game_id,
            currency_id=currency_id,
            is_allowed=is_allowed
        )
        db.add(gc)

    db.commit()
    db.refresh(gc)
    log_audit(
        db=db,
        actor_user=actor_user,
        action="GAME_CURRENCY_UPDATED",
        entity_type="game_currency",
        entity_id=None,
        tenant_id=None,
        old_data=old_data,
        new_data={
            "game_id": str(game_id),
            "currency_id": currency_id,
            "is_allowed": gc.is_allowed
        }
    )

    return {
        "game_id": game_id,
        "currency_id": currency_id,
        "is_allowed": gc.is_allowed
    }
