from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID, uuid4
from sqlalchemy import func
from app.models.user import User
from app.models.tenant import Tenant
from app.core.security import get_password_hash
from app.models.tenant_game import TenantGame
from app.models.tenant_provider import TenantProvider
from app.models.tenant_country import TenantCountry
from app.core.audit import log_audit
TENANT_ADMIN_ROLE_ID = 2
# Tenant-level statuses
TENANT_ALLOWED_STATUSES = {"active", "inactive", "suspended"}

# User-level statuses (mirror DB)
USER_ALLOWED_STATUSES = {"active", "blocked", "self_excluded"}





def create_tenant_admin(db: Session, tenant_id, data):

    # ✅ validate country belongs to tenant
    tenant_country = (
        db.query(TenantCountry)
        .filter(
            TenantCountry.tenant_id == tenant_id,
            TenantCountry.country_code == data.country_code,
            TenantCountry.is_active == True
        )
        .first()
    )

    if not tenant_country:
        raise HTTPException(
            status_code=400,
            detail="Country not enabled for this tenant"
        )

    # existing duplicate email check
    existing = (
        db.query(User)
        .filter(
            User.tenant_id == tenant_id,
            User.email == data.email
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Admin with this email already exists"
        )

    admin = User(
        user_id=uuid4(),
        tenant_id=tenant_id,
        role_id=TENANT_ADMIN_ROLE_ID,
        country_code=data.country_code,   # ✅ NEW
        email=data.email,
        password_hash=get_password_hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        status="active"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)
    # 🔐 AUDIT LOG
    log_audit(
        db=db,
        actor_user=data._actor_user,  # injected from API
        action="TENANT_ADMIN_CREATED",
        entity_type="tenant_admin",
        entity_id=admin.user_id,
        tenant_id=tenant_id,
        new_data={
            "email": admin.email,
            "tenant_id": str(tenant_id),
            "role": "tenant_admin",
        },
    )

    return admin



def list_tenant_admins(db: Session, tenant_id):
    return (
        db.query(User)
        .filter(
            User.tenant_id == tenant_id,
            User.role_id == TENANT_ADMIN_ROLE_ID
        )
        .order_by(User.created_at.desc())
        .all()
    )







def update_tenant_status(
    db: Session,
    tenant_id: UUID,
    status: str,
    actor_user=None
):
    if status not in TENANT_ALLOWED_STATUSES:
        raise HTTPException(400, "Invalid tenant status")

    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(404, "Tenant not found")

    old_status = tenant.status

    tenant.status = status

    

    # CASCADE to users
    if status in {"inactive", "suspended"}:
        (
            db.query(User)
            .filter(
                User.tenant_id == tenant_id,
                User.role_id.in_([1, 2]),  
                User.status == "active"
            )
            .update(
                {"status": "blocked"},
                synchronize_session=False
            )
        )

    db.commit()
    db.refresh(tenant)

    # 🔐 AUDIT LOG
    if actor_user:
        log_audit(
            db=db,
            actor_user=actor_user,
            action="TENANT_STATUS_UPDATED",
            entity_type="tenant",
            entity_id=tenant.tenant_id,
            tenant_id=tenant.tenant_id,
            old_data={"status": old_status},
            new_data={"status": tenant.status},
        )

    return tenant



def get_tenant_overview(
    db: Session,
    tenant_id: UUID
):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()

    if not tenant:
        raise HTTPException(404, "Tenant not found")

    total_players = (
        db.query(func.count(User.user_id))
        .filter(User.tenant_id == tenant_id, User.role_id == 1)
        .scalar()
    )

    active_players = (
        db.query(func.count(User.user_id))
        .filter(
            User.tenant_id == tenant_id,
            User.role_id == 1,
            User.status == "active"
        )
        .scalar()
    )

    total_games = (
        db.query(func.count(TenantGame.game_id))
        .filter(
            TenantGame.tenant_id == tenant_id,
            TenantGame.is_active == True
        )
        .scalar()
    )

    total_providers = (
        db.query(func.count(TenantProvider.provider_id))
        .filter(
            TenantProvider.tenant_id == tenant_id,
            TenantProvider.is_active == True
        )
        .scalar()
    )

    return {
        "tenant_id": tenant.tenant_id,
        "tenant_name": tenant.tenant_name,
        "status": tenant.status,
        "created_at": tenant.created_at,
        "total_players": total_players or 0,
        "active_players": active_players or 0,
        "total_games": total_games or 0,
        "total_providers": total_providers or 0,
    }