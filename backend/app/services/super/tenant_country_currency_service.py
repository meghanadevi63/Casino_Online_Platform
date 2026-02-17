from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.tenant_country_currency import TenantCountryCurrency
from app.models.currency import Currency
from app.core.audit import log_audit

def get_currencies(db: Session, tenant_id, country_code):
    rows = (
        db.query(
            TenantCountryCurrency.currency_id,
            Currency.currency_code,
            Currency.currency_name,
            TenantCountryCurrency.is_default,
            TenantCountryCurrency.is_active
        )
        .join(Currency, Currency.currency_id == TenantCountryCurrency.currency_id)
        .filter(
            TenantCountryCurrency.tenant_id == tenant_id,
            TenantCountryCurrency.country_code == country_code
        )
        .all()
    )

    return [
        {
            "currency_id": r.currency_id,
            "currency_code": r.currency_code,
            "currency_name": r.currency_name,
            "is_default": r.is_default,
            "is_active": r.is_active
        }
        for r in rows
    ]


def add_currency(db: Session, tenant_id, country_code, currency_id, is_default,actor_user):
    exists = (
        db.query(TenantCountryCurrency)
        .filter_by(
            tenant_id=tenant_id,
            country_code=country_code,
            currency_id=currency_id
        )
        .first()
    )
    if exists:
        raise HTTPException(400, "Currency already added")

    if is_default:
        # enforce single default
        db.query(TenantCountryCurrency).filter_by(
            tenant_id=tenant_id,
            country_code=country_code,
            is_default=True
        ).update({"is_default": False})

    row = TenantCountryCurrency(
        tenant_id=tenant_id,
        country_code=country_code,
        currency_id=currency_id,
        is_default=is_default,
        is_active=True
    )

    db.add(row)
    db.commit()

        # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_COUNTRY_CURRENCY_ADDED",
        entity_type="tenant_country_currency",
        entity_id=None,
        tenant_id=tenant_id,
        new_data={
            "country_code": country_code,
            "currency_id": currency_id,
            "is_default": is_default,
            "is_active": True
        }
    )

    return get_currencies(db, tenant_id, country_code)


def update_currency(db: Session, tenant_id, country_code, currency_id, is_default=None, is_active=None,actor_user=None):
    row = (
        db.query(TenantCountryCurrency)
        .filter_by(
            tenant_id=tenant_id,
            country_code=country_code,
            currency_id=currency_id
        )
        .first()
    )
    if not row:
        raise HTTPException(404, "Currency not found")

    
    old_data = {
        "currency_id": row.currency_id,
        "country_code": row.country_code,
        "is_default": row.is_default,
        "is_active": row.is_active
    }
    if is_default:
        db.query(TenantCountryCurrency).filter_by(
            tenant_id=tenant_id,
            country_code=country_code,
            is_default=True
        ).update({"is_default": False})

        row.is_default = True

    if is_active is not None:
        row.is_active = is_active

    db.commit()

        # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_COUNTRY_CURRENCY_UPDATED",
        entity_type="tenant_country_currency",
        entity_id=None,
        tenant_id=tenant_id,
        old_data=old_data,
        new_data={
            "currency_id": row.currency_id,
            "country_code": row.country_code,
            "is_default": row.is_default,
            "is_active": row.is_active
        }
    )
    return get_currencies(db, tenant_id, country_code)
