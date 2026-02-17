from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.super.super_tenant_admin import (
    TenantAdminCreate,
    TenantAdminResponse,
    TenantStatusUpdate,
    TenantOverviewResponse
)
from app.services.super.tenant_admin_service import (
    create_tenant_admin,
    list_tenant_admins,
    update_tenant_status,
    get_tenant_overview
)

router = APIRouter(
    prefix="/super/tenants",
    tags=["Super Admin - Tenant Admins"]
)


def super_admin_only(user):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")


@router.post(
    "/{tenant_id}/admins",
    response_model=TenantAdminResponse
)
def add_tenant_admin(
    tenant_id: UUID,
    payload: TenantAdminCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    payload._actor_user = current_user
    return create_tenant_admin(
        db=db,
        tenant_id=tenant_id,
        data=payload
    )


@router.get(
    "/{tenant_id}/admins",
    response_model=List[TenantAdminResponse]
)
def get_tenant_admins(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)

    return list_tenant_admins(db, tenant_id)


@router.patch(
    "/{tenant_id}/status",
    response_model=dict
)
def change_tenant_status(
    tenant_id: UUID,
    payload: TenantStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)

    tenant = update_tenant_status(
    db=db,
    tenant_id=tenant_id,
    status=payload.status,
    actor_user=current_user
)

    return {
        "tenant_id": tenant.tenant_id,
        "status": tenant.status
    }


@router.get(
    "/{tenant_id}/overview",
    response_model=TenantOverviewResponse
)
def tenant_overview(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    super_admin_only(current_user)
    return get_tenant_overview(db, tenant_id)
