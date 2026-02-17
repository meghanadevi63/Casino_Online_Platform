from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.super.tenant_country_currency import (
    AddTenantCountryCurrencyRequest,
    TenantCountryCurrencyResponse
)
from app.services.super.tenant_country_currency_service import (
    get_currencies,
    add_currency,
    update_currency
)

router = APIRouter(
    prefix="/super/tenants/{tenant_id}/countries/{country_code}/currencies",
    tags=["Super Admin – Tenant Country Currencies"]
)


def super_admin_only(user):
    if user.role_id != 4:
        raise PermissionError("Super admin access required")


@router.get("", response_model=List[TenantCountryCurrencyResponse])
def list_currencies(
    tenant_id: str,
    country_code: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return get_currencies(db, tenant_id, country_code)


@router.post("", response_model=List[TenantCountryCurrencyResponse])
def add_tenant_currency(
    tenant_id: str,
    country_code: str,
    payload: AddTenantCountryCurrencyRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return add_currency(
        db,
        tenant_id,
        country_code,
        payload.currency_id,
        payload.is_default,
        actor_user=current_user
    )


@router.patch("/{currency_id}", response_model=List[TenantCountryCurrencyResponse])
def update_tenant_currency(
    tenant_id: str,
    country_code: str,
    currency_id: int,
    is_default: bool | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return update_currency(
        db,
        tenant_id,
        country_code,
        currency_id,
        is_default,
        is_active,
        actor_user=current_user
    )
