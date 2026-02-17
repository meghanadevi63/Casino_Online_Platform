from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user,verify_password, get_password_hash
from app.models.user import User
from app.models.player import Player
from app.models.role import Role
from app.models.tenant import Tenant
from app.schemas.user import MeResponse, UserUpdate,PasswordUpdate
from app.models.tenant_country import TenantCountry
from app.models.currency import Currency
from app.models.kyc_document import KYCDocument

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=MeResponse)
def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = db.query(Role).filter(Role.role_id == current_user.role_id).first()
    tenant = db.query(Tenant).filter(Tenant.tenant_id == current_user.tenant_id).first()
    player = db.query(Player).filter(Player.player_id == current_user.user_id).first()

    #  Currency resolution (unchanged)
    currency_symbol = None
    currency_code = None

    if current_user.country_code:
        tenant_country = (
            db.query(TenantCountry)
            .filter(
                TenantCountry.tenant_id == current_user.tenant_id,
                TenantCountry.country_code == current_user.country_code,
                TenantCountry.is_active.is_(True)
            )
            .first()
        )

        if tenant_country:
            currency = (
                db.query(Currency)
                .filter(Currency.currency_code == tenant_country.currency_code)
                .first()
            )
            if currency:
                currency_code = currency.currency_code
                currency_symbol = currency.symbol

    #  Normalize KYC status
    if not player:
        kyc_status = "not_applicable"
        kyc_rejection_reason = None
    else:
        kyc_status = player.kyc_status

        latest_kyc = (
            db.query(KYCDocument)
            .filter(KYCDocument.user_id == current_user.user_id)
            .order_by(KYCDocument.uploaded_at.desc())
            .first()
        )

        kyc_rejection_reason = (
            latest_kyc.rejection_reason
            if latest_kyc and latest_kyc.verification_status == "rejected"
            else None
        )

    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,

        "role": role.role_name if role else None,
        "role_id": current_user.role_id,

        "tenant_id": current_user.tenant_id,
        "tenant_name": tenant.tenant_name if tenant else None,

        "country_code": current_user.country_code,
        "status": current_user.status,

        "kyc_status": kyc_status,
        "kyc_rejection_reason": kyc_rejection_reason,

        "currency_code": currency_code,
        "currency_symbol": currency_symbol,

        "created_at": current_user.created_at
    }


@router.patch("/me")
def update_me(
    data: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if data.first_name is not None:
        current_user.first_name = data.first_name
    if data.last_name is not None:
        current_user.last_name = data.last_name
    
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "message": "Profile updated"}


@router.patch("/me/password")
def change_password(data: PasswordUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    current_user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}