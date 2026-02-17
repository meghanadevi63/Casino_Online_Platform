from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.super.tenant_country import (
    TenantCountryCreate,
    TenantCountryUpdate,
    TenantCountryResponse
)
from app.services.super.tenant_country_service import (
    get_tenant_countries,
    add_country_to_tenant,
    update_tenant_country,
    soft_delete_tenant_country
)

router = APIRouter(
    prefix="/super/tenants",
    tags=["Super Admin – Tenant Countries"]
)

def super_admin_only(user):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")


@router.get("/{tenant_id}/countries", response_model=list[TenantCountryResponse])
def list_tenant_countries(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return get_tenant_countries(db, tenant_id)


@router.post(
    "/{tenant_id}/countries",
    response_model=TenantCountryResponse
)
def add_country(
    tenant_id: str,
    payload: TenantCountryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)

    return add_country_to_tenant(
        db,
        tenant_id,
        payload.country_code,
        payload.currency_code,
        actor_user=current_user
    )


@router.patch(
    "/{tenant_id}/countries/{country_code}",
    response_model=TenantCountryResponse
)
def update_country(
    tenant_id: str,
    country_code: str,
    payload: TenantCountryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)

    return update_tenant_country(
        db,
        tenant_id,
        country_code,
        payload.is_active,
        actor_user=current_user
    )



@router.delete("/{tenant_id}/countries/{country_code}")
def remove_country(
    tenant_id: str,
    country_code: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    soft_delete_tenant_country(db, tenant_id, country_code, actor_user=current_user)
    return {"status": "country disabled"}
