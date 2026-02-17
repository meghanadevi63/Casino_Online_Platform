from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.tenant_game import TenantGame
from app.models.game import Game
from app.models.tenant import Tenant
from app.models.game_provider import GameProvider 
from app.core.audit import log_audit

def list_tenant_games(db: Session, tenant_id):
    
    
    rows = (
        db.query(TenantGame, Game, GameProvider)
        .join(Game, Game.game_id == TenantGame.game_id)
        .join(GameProvider, GameProvider.provider_id == Game.provider_id)
        .filter(TenantGame.tenant_id == tenant_id)
        .all()
    )

    return [
        {
            "tenant_id": tg.tenant_id,
            "game_id": tg.game_id,
            "game_name": game.game_name,
            "provider_name": provider.provider_name,
            "is_active": tg.is_active,
            "contract_start": tg.contract_start,
            "contract_end": tg.contract_end,
            "min_bet_override": tg.min_bet_override,
            "max_bet_override": tg.max_bet_override,
            "rtp_override": tg.rtp_override,
            "created_at": tg.created_at
        }
        for tg, game, provider in rows
    ]


def add_game_to_tenant(db: Session, tenant_id, data, actor_user):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    #  1. Fetch Game AND Provider to populate response later
    game_data = (
        db.query(Game, GameProvider)
        .join(GameProvider, GameProvider.provider_id == Game.provider_id)
        .filter(Game.game_id == data.game_id)
        .first()
    )
    
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
        
    game, provider = game_data

    existing = (
        db.query(TenantGame)
        .filter(
            TenantGame.tenant_id == tenant_id,
            TenantGame.game_id == data.game_id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Game already enabled for tenant")

    if (
        data.min_bet_override is not None
        and data.max_bet_override is not None
        and data.min_bet_override >= data.max_bet_override
    ):
        raise HTTPException(
            status_code=400,
            detail="min_bet_override must be less than max_bet_override"
        )

    tenant_game = TenantGame(
        tenant_id=tenant_id,
        game_id=data.game_id,
        is_active=data.is_active,
        contract_start=data.contract_start,
        contract_end=data.contract_end,
        min_bet_override=data.min_bet_override,
        max_bet_override=data.max_bet_override,
        rtp_override=data.rtp_override
    )

    db.add(tenant_game)
    db.commit()
    db.refresh(tenant_game)

    #  AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_GAME_ENABLED",
        entity_type="tenant_game",
        entity_id=None,
        tenant_id=tenant_id,
        new_data={
            "game_id": str(data.game_id),
            "game_name": game.game_name, 
            "is_active": data.is_active,
            "min_bet_override": data.min_bet_override,
            "max_bet_override": data.max_bet_override,
        }
    )

    # 2. Return a DICTIONARY that matches TenantGameResponse
   
    return {
        "tenant_id": tenant_game.tenant_id,
        "game_id": tenant_game.game_id,
        "game_name": game.game_name,           
        "provider_name": provider.provider_name, 
        "is_active": tenant_game.is_active,
        "contract_start": tenant_game.contract_start,
        "contract_end": tenant_game.contract_end,
        "min_bet_override": tenant_game.min_bet_override,
        "max_bet_override": tenant_game.max_bet_override,
        "rtp_override": tenant_game.rtp_override,
        "created_at": tenant_game.created_at
    }


def update_tenant_game(db: Session, tenant_id, game_id, data, actor_user):
    row = (
        db.query(TenantGame, Game, GameProvider)
        .join(Game, Game.game_id == TenantGame.game_id)
        .join(GameProvider, GameProvider.provider_id == Game.provider_id)
        .filter(
            TenantGame.tenant_id == tenant_id,
            TenantGame.game_id == game_id
        )
        .first()
    )

    if not row:
        raise HTTPException(status_code=404, detail="Tenant game not found")
    
    tg, game, provider = row

    
    old_data = {
        "is_active": tg.is_active,
        "contract_start": str(tg.contract_start) if tg.contract_start else None,
        "contract_end": str(tg.contract_end) if tg.contract_end else None,
        "min_bet_override": float(tg.min_bet_override) if tg.min_bet_override is not None else None,
        "max_bet_override": float(tg.max_bet_override) if tg.max_bet_override is not None else None,
        "rtp_override": float(tg.rtp_override) if tg.rtp_override is not None else None
    }

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tg, field, value)

    db.commit()
    db.refresh(tg)

   
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_GAME_UPDATED",
        entity_type="tenant_game",
        tenant_id=tenant_id,
        old_data=old_data,
        new_data=data.model_dump(mode='json', exclude_unset=True)
    )

    return {
        "tenant_id": tg.tenant_id,
        "game_id": tg.game_id,
        "game_name": game.game_name,
        "provider_name": provider.provider_name,
        "is_active": tg.is_active,
        "contract_start": tg.contract_start,
        "contract_end": tg.contract_end,
        "min_bet_override": tg.min_bet_override,
        "max_bet_override": tg.max_bet_override,
        "rtp_override": tg.rtp_override,
        "created_at": tg.created_at
    }