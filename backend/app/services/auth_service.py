from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User
from app.models.tenant import Tenant
from app.core.security import verify_password, create_access_token

def login_user(db: Session, tenant_domain: str, email: str, password: str):
    tenant = db.execute(
        select(Tenant).where(Tenant.domain == tenant_domain)
    ).scalar_one_or_none()

    if not tenant:
        raise ValueError("Invalid tenant")

    user = db.execute(
        select(User).where(
            User.tenant_id == tenant.tenant_id,
            User.email == email
        )
    ).scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid credentials")

    token = create_access_token({
        "sub": str(user.user_id),
        "tenant_id": str(user.tenant_id),
        "role_id": user.role_id
    })

    return token
