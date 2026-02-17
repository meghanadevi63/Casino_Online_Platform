from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.super_tenant import (
    SuperTenantCreateRequest,
    SuperTenantUpdateRequest,
    SuperTenantResponse
)
from app.services.super_tenant_service import (
    list_tenants,
    create_tenant,
    get_tenant,
    update_tenant
)

router = APIRouter(
    prefix="/super/tenants",
    tags=["Super Admin - Tenants"]
)


def require_super_admin(user: User):
    if user.role_id != 4:
        raise HTTPException(
            status_code=403,
            detail="Super admin access required"
        )


@router.get("", response_model=list[SuperTenantResponse])
def get_all_tenants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return list_tenants(db)


@router.post("", response_model=SuperTenantResponse)
def create_new_tenant(
    data: SuperTenantCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return create_tenant(
        db=db,
        tenant_name=data.tenant_name,
        domain=data.domain,
        actor_user=current_user
    )


@router.get("/{tenant_id}", response_model=SuperTenantResponse)
def get_single_tenant(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return get_tenant(db, tenant_id)


@router.patch("/{tenant_id}", response_model=SuperTenantResponse)
def update_existing_tenant(
    tenant_id: str,
    data: SuperTenantUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_super_admin(current_user)
    return update_tenant(
        db=db,
        tenant_id=tenant_id,
        status=data.status,
        domain=data.domain,
        actor_user=current_user
    )
