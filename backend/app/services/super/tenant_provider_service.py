from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.core.audit import log_audit
from app.models.tenant_provider import TenantProvider
from app.models.game_provider import GameProvider


def list_tenant_providers(db: Session, tenant_id):
    rows = (
        db.query(TenantProvider, GameProvider)
        .join(GameProvider, GameProvider.provider_id == TenantProvider.provider_id)
        .filter(TenantProvider.tenant_id == tenant_id)
        .all()
    )

    return [
        {
            "provider_id": provider.provider_id,
            "provider_name": provider.provider_name,
            "is_active": tp.is_active,
            "contract_start": tp.contract_start,
            "contract_end": tp.contract_end,
        }
        for tp, provider in rows
    ]


def add_tenant_provider(db: Session, tenant_id, data,actor_user):
    existing = (
        db.query(TenantProvider)
        .filter(
            TenantProvider.tenant_id == tenant_id,
            TenantProvider.provider_id == data.provider_id
        )
        .first()
    )

    if existing:
        raise HTTPException(400, "Provider already enabled for tenant")

    provider = (
        db.query(GameProvider)
        .filter(
            GameProvider.provider_id == data.provider_id,
            GameProvider.is_active == True
        )
        .first()
    )

    if not provider:
        raise HTTPException(404, "Provider not found or inactive")

    tp = TenantProvider(
        tenant_id=tenant_id,
        provider_id=data.provider_id,
        is_active=data.is_active,
        contract_start=data.contract_start,
        contract_end=data.contract_end,
    )

    db.add(tp)
    db.commit()
    db.refresh(tp)

        # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_PROVIDER_ADDED",
        entity_type="tenant_provider",
        entity_id=None,  # composite PK
        tenant_id=tenant_id,
        new_data={
            "provider_id": provider.provider_id,
            "provider_name": provider.provider_name,
            "is_active": tp.is_active,
            "contract_start": str(tp.contract_start),
            "contract_end": str(tp.contract_end),
        }
    )

    # ✅ RETURN SHAPE MATCHES RESPONSE MODEL
    return {
        "provider_id": provider.provider_id,
        "provider_name": provider.provider_name,
        "is_active": tp.is_active,
        "contract_start": tp.contract_start,
        "contract_end": tp.contract_end,
    }


def update_tenant_provider(db: Session, tenant_id, provider_id, data,actor_user):
    tp = (
        db.query(TenantProvider)
        .filter(
            TenantProvider.tenant_id == tenant_id,
            TenantProvider.provider_id == provider_id
        )
        .first()
    )

    if not tp:
        raise HTTPException(404, "Tenant provider not found")


    old_data = {
        "provider_id": provider_id,
        "is_active": tp.is_active,
        "contract_start": str(tp.contract_start),
        "contract_end": str(tp.contract_end),
    }

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tp, field, value)

    db.commit()
    db.refresh(tp)

    provider = db.query(GameProvider).filter(
        GameProvider.provider_id == provider_id
    ).first()

        # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_PROVIDER_UPDATED",
        entity_type="tenant_provider",
        entity_id=None,
        tenant_id=tenant_id,
        old_data=old_data,
        new_data={
            "provider_id": provider.provider_id,
            "is_active": tp.is_active,
            "contract_start": str(tp.contract_start),
            "contract_end": str(tp.contract_end),
        }
    )
    
    return {
        "provider_id": provider.provider_id,
        "provider_name": provider.provider_name,
        "is_active": tp.is_active,
        "contract_start": tp.contract_start,
        "contract_end": tp.contract_end,
    }
