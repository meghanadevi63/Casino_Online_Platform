from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.tenant import Tenant


def get_all_tenants(db: Session):
    return db.query(Tenant).order_by(Tenant.created_at.desc()).all()


def get_tenant_by_id(db: Session, tenant_id):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


def get_tenant_by_domain(db: Session, domain: str):
    tenant = db.query(Tenant).filter(Tenant.domain == domain).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
