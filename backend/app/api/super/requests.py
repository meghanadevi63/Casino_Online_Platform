from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.provider_access_request import ProviderAccessRequest
from app.schemas.super.super_tenant_provider import TenantProviderCreate
from app.services.super.tenant_provider_service import add_tenant_provider
from app.models.tenant import Tenant
from app.models.game_provider import GameProvider
from app.schemas.admin_marketplace import RejectRequestPayload

router = APIRouter(
    prefix="/super/requests",
    tags=["Super Admin - Requests"]
)

def super_admin_only(user):
    if user.role_id != 4:
        raise HTTPException(403, "Super admin access required")

@router.get("")
def list_pending_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    super_admin_only(current_user)
    
    rows = (
        db.query(ProviderAccessRequest, Tenant.tenant_name, GameProvider.provider_name)
        .join(Tenant, Tenant.tenant_id == ProviderAccessRequest.tenant_id)
        .join(GameProvider, GameProvider.provider_id == ProviderAccessRequest.provider_id)
        .filter(ProviderAccessRequest.status == 'pending')
        .order_by(ProviderAccessRequest.requested_at.desc())
        .all()
    )

    return [
        {
            "request_id": r.ProviderAccessRequest.request_id,
            "tenant_id": r.ProviderAccessRequest.tenant_id,
            "tenant_name": r.tenant_name,
            "provider_id": r.ProviderAccessRequest.provider_id,
            "provider_name": r.provider_name,
            "proposed_start_date": r.ProviderAccessRequest.proposed_start_date,
            "requested_at": r.ProviderAccessRequest.requested_at
        }
        for r in rows
    ]

@router.post("/{request_id}/approve")
def approve_request(
    request_id: UUID,
    payload: TenantProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    
    req = db.query(ProviderAccessRequest).filter(ProviderAccessRequest.request_id == request_id).first()
    if not req or req.status != 'pending':
        raise HTTPException(400, "Invalid request")

    if payload.provider_id != req.provider_id:
        raise HTTPException(400, "Provider ID mismatch")

    add_tenant_provider(db, req.tenant_id, payload, current_user)

    req.status = 'approved'
  
    req.processed_at = datetime.now(timezone.utc)
    req.processed_by = current_user.user_id
    
    db.commit()
    return {"status": "approved"}

@router.post("/{request_id}/reject")
def reject_request(
    request_id: UUID,
    payload: RejectRequestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    super_admin_only(current_user)
    
    req = db.query(ProviderAccessRequest).filter(ProviderAccessRequest.request_id == request_id).first()
    if not req or req.status != 'pending':
        raise HTTPException(400, "Invalid request")

    req.status = 'rejected'
    req.admin_notes = payload.admin_notes
   
    req.processed_at = datetime.now(timezone.utc)
    req.processed_by = current_user.user_id
    
    db.commit()
    return {"status": "rejected"}