from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.game import Game
from app.models.tenant_game import TenantGame
from app.models.game_provider import GameProvider
from app.core.audit import log_audit

from datetime import datetime, timezone 

def list_tenant_games(db: Session, tenant_id):
    """
    Join TenantGame -> Game -> Provider
    Returns effective settings (Overrides or Global Defaults)
    """
    rows = (
        db.query(TenantGame, Game, GameProvider)
        .join(Game, Game.game_id == TenantGame.game_id)
        .join(GameProvider, GameProvider.provider_id == Game.provider_id)
        .filter(TenantGame.tenant_id == tenant_id)
        .all()
    )

    results = []
    for tg, game, provider in rows:
       
        min_bet = tg.min_bet_override if tg.min_bet_override is not None else game.min_bet
        max_bet = tg.max_bet_override if tg.max_bet_override is not None else game.max_bet
        rtp = tg.rtp_override if tg.rtp_override is not None else game.rtp_percentage

        results.append({
            "game_id": game.game_id,
            "game_name": game.game_name,
            "game_code": game.game_code,
            "provider_name": provider.provider_name,
            "is_active": tg.is_active,
            "min_bet": float(min_bet),
            "max_bet": float(max_bet),
            "rtp": float(rtp) if rtp is not None else None,
            "created_at": tg.created_at 
        })
    return results


def update_tenant_game_config(db: Session, tenant_id, game_id, payload, actor_user):
    """
    Updates tenant-specific game overrides (Bet limits/Status)
    """
    tg = db.query(TenantGame).filter(
        TenantGame.tenant_id == tenant_id,
        TenantGame.game_id == game_id
    ).first()

    if not tg:
        raise HTTPException(status_code=404, detail="Game not found in your library")

   
    data = payload.model_dump(exclude_unset=True)
    
   
    new_min = data.get("min_bet_override", tg.min_bet_override)
    new_max = data.get("max_bet_override", tg.max_bet_override)

    if new_min is not None and new_max is not None:
        if float(new_min) >= float(new_max):
            raise HTTPException(status_code=400, detail="Min bet must be less than Max bet")

  
    for k, v in data.items():
        setattr(tg, k, v)

    
    db.commit()
    
    
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_GAME_CONFIG_UPDATED",
        entity_type="tenant_game",
        entity_id=None, 
        tenant_id=tenant_id,
        new_data=data
    )

    return {"status": "updated"}