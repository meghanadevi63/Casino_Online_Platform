from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.super.super_tenant_provider import (
    TenantProviderCreate,
    TenantProviderUpdate,
    TenantProviderResponse
)
from app.services.super.tenant_provider_service import (
    list_tenant_providers,
    add_tenant_provider,
    update_tenant_provider
)

router = APIRouter(
    prefix="/super/tenants",
    tags=["Super Admin - Tenant Providers"]
)


def super_admin_only(user):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")


@router.get(
    "/{tenant_id}/providers",
    response_model=List[TenantProviderResponse]
)
def get_tenant_providers(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return list_tenant_providers(db, tenant_id)


@router.post(
    "/{tenant_id}/providers",
    response_model=TenantProviderResponse
)
def enable_provider_for_tenant(
    tenant_id: UUID,
    payload: TenantProviderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return add_tenant_provider(db, tenant_id, payload,actor_user=current_user)


@router.patch(
    "/{tenant_id}/providers/{provider_id}",
    response_model=TenantProviderResponse
)
def update_provider_for_tenant(
    tenant_id: UUID,
    provider_id: int,
    payload: TenantProviderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return update_tenant_provider(db, tenant_id, provider_id, payload,actor_user=current_user)
