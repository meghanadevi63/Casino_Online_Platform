from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import uuid4
from app.core.audit import log_audit
from app.models.tenant import Tenant


def list_tenants(db: Session):
    return (
        db.query(Tenant)
        .order_by(Tenant.created_at.desc())
        .all()
    )


def create_tenant(
    db: Session,
    tenant_name: str,
    domain: str | None,
    actor_user
):
    existing = (
        db.query(Tenant)
        .filter(Tenant.tenant_name == tenant_name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Tenant already exists"
        )

    tenant = Tenant(
        tenant_id=uuid4(),
        tenant_name=tenant_name,
        domain=domain,
        status="active"
    )

    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    # AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_CREATED",
        entity_type="tenant",
        entity_id=tenant.tenant_id,
        tenant_id=tenant.tenant_id,
        new_data={
            "tenant_name": tenant.tenant_name,
            "domain": tenant.domain,
            "status": tenant.status
        }
    )
    return tenant


def get_tenant(db: Session, tenant_id):
    tenant = (
        db.query(Tenant)
        .filter(Tenant.tenant_id == tenant_id)
        .first()
    )

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found"
        )

    return tenant


def update_tenant(
    db: Session,
    tenant_id,
    status: str | None,
    domain: str | None,
    actor_user
):
    tenant = get_tenant(db, tenant_id)
    old_data = {
        "status": tenant.status,
        "domain": tenant.domain
    }
    if status:
        tenant.status = status

    if domain is not None:
        tenant.domain = domain

    #  AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_UPDATED",
        entity_type="tenant",
        entity_id=tenant.tenant_id,
        tenant_id=tenant.tenant_id,
        old_data=old_data,
        new_data={
            "status": tenant.status,
            "domain": tenant.domain
        }
    )

    db.commit()
    db.refresh(tenant)
    return tenant
