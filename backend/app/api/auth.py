from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest
from app.services.auth_service import login_user
from app.services.registration_service import register_player

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return register_player(db, data)

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        token = login_user(
            db,
            data.tenant_domain,
            data.email,
            data.password
        )
        return {"access_token": token}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    
@router.get("/lookup-tenants")
def lookup_tenants_by_email(email: str, db: Session = Depends(get_db)):
    from app.models.user import User
    from app.models.tenant import Tenant

    # Find all tenants where this email is registered
    results = (
        db.query(Tenant.tenant_name, Tenant.domain)
        .join(User, User.tenant_id == Tenant.tenant_id)
        .filter(User.email == email)
        .all()
    )

    if not results:
        return []

    return [
        {"tenant_name": r.tenant_name, "domain": r.domain} 
        for r in results
    ]
