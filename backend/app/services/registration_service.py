from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import (
    User,
    Player,
    Wallet,
    WalletType,
    Tenant,
    Role,
    Currency
)
from app.models.tenant_country import TenantCountry
from app.core.security import hash_password


def register_player(db: Session, data):
    # 1️Validate tenant by domain
    tenant = (
        db.query(Tenant)
        .filter(
            Tenant.domain == data.tenant_domain,
            Tenant.status == "active"
        )
        .first()
    )

    if not tenant:
        raise HTTPException(status_code=400, detail="Invalid tenant domain")

    # 2️ Check duplicate email inside tenant
    existing_user = (
        db.query(User)
        .filter(
            User.tenant_id == tenant.tenant_id,
            User.email == data.email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists for this tenant")

    # 3️ Resolve PLAYER role
    role = (
        db.query(Role)
        .filter(Role.role_name == "PLAYER")
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=500,
            detail="PLAYER role not configured"
        )

    # 4️ Resolve tenant + country mapping
    tenant_country = (
        db.query(TenantCountry)
        .filter(
            TenantCountry.tenant_id == tenant.tenant_id,
            TenantCountry.country_code == data.country_code,
            TenantCountry.is_active.is_(True)
        )
        .first()
    )

    if not tenant_country:
        raise HTTPException(
            status_code=400,
            detail="Selected country is not supported by this tenant"
        )

    # 5️ Resolve currency for selected country
    currency = (
        db.query(Currency)
        .filter(Currency.currency_code == tenant_country.currency_code)
        .first()
    )

    if not currency:
        raise HTTPException(
            status_code=500,
            detail="Currency configuration missing for tenant country"
        )

    # 6️ Create User
    user = User(
        tenant_id=tenant.tenant_id,
        role_id=role.role_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
        country_code=data.country_code
    )

    db.add(user)
    db.flush()  # get user_id

    # 7️ Create Player
    player = Player(player_id=user.user_id)
    db.add(player)

    # 8️ Create wallets for all wallet types with resolved currency
    wallet_types = db.query(WalletType).all()

    if not wallet_types:
        raise HTTPException(
            status_code=500,
            detail="Wallet types not configured"
        )

    for wt in wallet_types:
        wallet = Wallet(
            player_id=user.user_id,
            tenant_id=tenant.tenant_id,
            currency_id=currency.currency_id,
            wallet_type_id=wt.wallet_type_id,
            balance=0
        )
        db.add(wallet)

    db.commit()

    return {
        "user_id": str(user.user_id),
        "email": user.email,
        "tenant": tenant.tenant_name,
        "country": data.country_code,
        "currency": currency.currency_code
    }
