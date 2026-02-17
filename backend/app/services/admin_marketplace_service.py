from sqlalchemy.orm import Session
from sqlalchemy import exists, and_
from fastapi import HTTPException
from app.models.game import Game
from app.models.game_provider import GameProvider
from app.models.tenant_game import TenantGame
from app.models.tenant_provider import TenantProvider
from app.models.provider_access_request import ProviderAccessRequest
from app.core.audit import log_audit

def get_marketplace_catalog(db: Session, tenant_id):
    results = db.query(
        Game,
        GameProvider.provider_name,
        GameProvider.provider_id,
        # Check if game is already enabled for tenant
        exists().where(
            and_(
                TenantGame.game_id == Game.game_id, 
                TenantGame.tenant_id == tenant_id,
                TenantGame.is_active == True
            )
        ).label("is_enabled"),
        # Check if tenant has contract with provider
        exists().where(
            and_(
                TenantProvider.provider_id == Game.provider_id,
                TenantProvider.tenant_id == tenant_id,
                TenantProvider.is_active == True
            )
        ).label("has_contract")
    ).join(GameProvider, Game.provider_id == GameProvider.provider_id)\
     .filter(Game.is_active == True)\
     .all()

    response = []
    for game, provider_name, provider_id, is_enabled, has_contract in results:
        status = "LOCKED"
        if is_enabled:
            status = "ENABLED"
        elif has_contract:
            status = "AVAILABLE"
        
        response.append({
            "game_id": game.game_id,
            "game_name": game.game_name,
            "game_code": game.game_code,
            "provider_name": provider_name,
            "provider_id": provider_id, 
            "rtp": float(game.rtp_percentage) if game.rtp_percentage else None,
            "status": status
        })
    
    return response


def add_game_to_library(db: Session, tenant_id, data, actor_user):
    game = db.query(Game).filter(Game.game_id == data.game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    has_contract = db.query(TenantProvider).filter(
        TenantProvider.tenant_id == tenant_id,
        TenantProvider.provider_id == game.provider_id,
        TenantProvider.is_active == True
    ).first()

    if not has_contract:
        raise HTTPException(status_code=403, detail="Contract required with provider")

    if (
        data.min_bet_override is not None
        and data.max_bet_override is not None
        and data.min_bet_override >= data.max_bet_override
    ):
        raise HTTPException(status_code=400, detail="Min bet must be less than Max bet")

    existing_tg = db.query(TenantGame).filter(
        TenantGame.tenant_id == tenant_id,
        TenantGame.game_id == data.game_id
    ).first()

    if existing_tg:
        if existing_tg.is_active:
            return {"message": "Game already enabled"}
        existing_tg.is_active = True
        existing_tg.min_bet_override = data.min_bet_override
        existing_tg.max_bet_override = data.max_bet_override
        existing_tg.rtp_override = data.rtp_override
        existing_tg.contract_start = data.contract_start
        existing_tg.contract_end = data.contract_end
    else:
        new_tg = TenantGame(
            tenant_id=tenant_id,
            game_id=data.game_id,
            is_active=True,
            min_bet_override=data.min_bet_override,
            max_bet_override=data.max_bet_override,
            rtp_override=data.rtp_override,
            contract_start=data.contract_start,
            contract_end=data.contract_end
        )
        db.add(new_tg)

    db.commit()
    
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_GAME_ENABLED",
        entity_type="tenant_game",
        tenant_id=tenant_id,
        new_data=data.model_dump(mode='json')
    )

    return {"status": "success", "message": "Game added to library"}


def request_provider_access(db: Session, tenant_id, provider_id, proposed_date, actor_user):
    # 1. Check pending requests
    existing = db.query(ProviderAccessRequest).filter(
        ProviderAccessRequest.tenant_id == tenant_id,
        ProviderAccessRequest.provider_id == provider_id,
        ProviderAccessRequest.status == 'pending'
    ).first()
    
    if existing:
        raise HTTPException(400, "Request already pending for this provider")

    # 2. Check already active contract
    active = db.query(TenantProvider).filter(
        TenantProvider.tenant_id == tenant_id,
        TenantProvider.provider_id == provider_id,
        TenantProvider.is_active == True
    ).first()
    
    if active:
        raise HTTPException(400, "You already have access to this provider")

    # 3. Create Request
    req = ProviderAccessRequest(
        tenant_id=tenant_id,
        provider_id=provider_id,
        proposed_start_date=proposed_date,
        status='pending'
    )
    db.add(req)
    db.commit()
    
    log_audit(
        db=db,
        actor_user=actor_user,
        action="ACCESS_REQUESTED",
        entity_type="game_provider",
        tenant_id=tenant_id,
        new_data={"provider_id": provider_id, "proposed_date": str(proposed_date)}
    )

    return {"status": "success", "message": "Access request sent to Platform Owner"}



def get_tenant_requests(db: Session, tenant_id):
    # Join with GameProvider to get the name
    rows = (
        db.query(ProviderAccessRequest, GameProvider.provider_name)
        .join(GameProvider, GameProvider.provider_id == ProviderAccessRequest.provider_id)
        .filter(ProviderAccessRequest.tenant_id == tenant_id)
        .order_by(ProviderAccessRequest.requested_at.desc())
        .all()
    )

    return [
        {
            "request_id": req.request_id,
            "provider_name": provider_name,
            "status": req.status,
            "proposed_start_date": req.proposed_start_date,
            "requested_at": req.requested_at,
            "processed_at": req.processed_at,
            "admin_notes": req.admin_notes
        }
        for req, provider_name in rows
    ]