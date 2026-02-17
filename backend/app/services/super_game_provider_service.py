from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.game_provider import GameProvider
from app.core.audit import log_audit

def list_game_providers(db: Session):
    return db.query(GameProvider).order_by(GameProvider.created_at.desc()).all()

def create_game_provider(db: Session, data, actor_user):
    exists = db.query(GameProvider).filter(GameProvider.provider_name == data.provider_name).first()
    if exists:
        raise HTTPException(status_code=400, detail="Game provider already exists")

    provider = GameProvider(
        provider_name=data.provider_name,
        website=data.website,
        is_active=True 
    )

    db.add(provider)
    db.commit()
    db.refresh(provider)

    log_audit(
        db=db,
        actor_user=actor_user,
        action="GAME_PROVIDER_CREATED",
        entity_type="game_provider",
        entity_id=None,
        new_data={"provider_name": provider.provider_name, "website": provider.website}
    )
    return provider

def update_game_provider(db: Session, provider_id: int, data, actor_user):
    provider = db.query(GameProvider).filter(GameProvider.provider_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Game provider not found")

    old_data = {
        "provider_name": provider.provider_name,
        "website": provider.website,
        "is_active": provider.is_active
    }

    # Apply updates
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider, field, value)

    db.commit()
    db.refresh(provider)

    log_audit(
        db=db,
        actor_user=actor_user,
        action="GAME_PROVIDER_UPDATED",
        entity_type="game_provider",
        entity_id=None,
        old_data=old_data,
        new_data=update_data
    )
    
    return provider