from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.tenant import TenantResponse
from app.services.tenant_service import (
    get_all_tenants,
    get_tenant_by_id,
    get_tenant_by_domain
)

from app.models.tenant import Tenant
from app.models.tenant_country import TenantCountry
from app.models.country import Country

router = APIRouter(
    prefix="/tenants",
    tags=["Tenants"]
)

# 1️ List all tenants
@router.get("", response_model=list[TenantResponse])
def list_tenants(db: Session = Depends(get_db)):
    return get_all_tenants(db)

# 2️ Get tenant by ID
@router.get("/id/{tenant_id}", response_model=TenantResponse)
def get_tenant(tenant_id: UUID, db: Session = Depends(get_db)):
    return get_tenant_by_id(db, tenant_id)

# 3️ Get tenant by domain
@router.get("/by-domain/{domain}", response_model=TenantResponse)
def get_tenant_domain(domain: str, db: Session = Depends(get_db)):
    return get_tenant_by_domain(db, domain)

# 4️ Get countries supported by tenant (IMPORTANT)
@router.get("/by-domain/{domain}/countries")
def get_tenant_countries(domain: str, db: Session = Depends(get_db)):
    tenant = (
        db.query(Tenant)
        .filter(
            Tenant.domain == domain,
            Tenant.status == "active"
        )
        .first()
    )

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    rows = (
        db.query(
            TenantCountry.country_code,
            Country.country_name
        )
        .join(Country, Country.country_code == TenantCountry.country_code)
        .filter(
            TenantCountry.tenant_id == tenant.tenant_id,
            TenantCountry.is_active.is_(True)
        )
        .all()
    )

    return [
        {
            "country_code": r.country_code,
            "country_name": r.country_name
        }
        for r in rows
    ]
