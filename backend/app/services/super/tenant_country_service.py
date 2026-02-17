from sqlalchemy.orm import Session
from app.models.tenant_country import TenantCountry
from app.models.country import Country
from fastapi import HTTPException
from app.core.audit import log_audit
def get_tenant_countries(db: Session, tenant_id):
    rows = (
        db.query(
            TenantCountry.country_code,
            Country.country_name,
            TenantCountry.currency_code,
            TenantCountry.is_active
        )
        .join(Country, Country.country_code == TenantCountry.country_code)
        .filter(TenantCountry.tenant_id == tenant_id)
        .all()
    )

    return rows

def add_country_to_tenant(db: Session, tenant_id, country_code, currency_code,actor_user):
    exists = (
        db.query(TenantCountry)
        .filter_by(tenant_id=tenant_id, country_code=country_code)
        .first()
    )
    if exists:
        raise HTTPException(400, "Country already configured")

    row = TenantCountry(
        tenant_id=tenant_id,
        country_code=country_code,
        currency_code=currency_code,
        is_active=True
    )
    db.add(row)
    db.commit()
    

    # 🔥 JOIN to get country_name
    result = (
        db.query(
            TenantCountry.country_code,
            Country.country_name,
            TenantCountry.currency_code,
            TenantCountry.is_active
        )
        .join(Country, Country.country_code == TenantCountry.country_code)
        .filter(
            TenantCountry.tenant_id == tenant_id,
            TenantCountry.country_code == country_code
        )
        .first()
    )

    
        # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_COUNTRY_ADDED",
        entity_type="tenant_country",
        entity_id=None,  # composite key
        tenant_id=tenant_id,
        new_data={
            "country_code": country_code,
            "currency_code": currency_code,
            "is_active": True
        }
    )

    return {
        "country_code": result.country_code,
        "country_name": result.country_name,
        "currency_code": result.currency_code,
        "is_active": result.is_active
    }



def update_tenant_country(db: Session, tenant_id, country_code, is_active,actor_user):
    row = (
        db.query(TenantCountry)
        .filter_by(tenant_id=tenant_id, country_code=country_code)
        .first()
    )
    if not row:
        raise HTTPException(404, "Country not found")

    old_data = {
        "country_code": row.country_code,
        "currency_code": row.currency_code,
        "is_active": row.is_active
    }
    row.is_active = is_active
    db.commit()

    result = (
        db.query(
            TenantCountry.country_code,
            Country.country_name,
            TenantCountry.currency_code,
            TenantCountry.is_active
        )
        .join(Country, Country.country_code == TenantCountry.country_code)
        .filter(
            TenantCountry.tenant_id == tenant_id,
            TenantCountry.country_code == country_code
        )
        .first()
    )
    # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_COUNTRY_UPDATED",
        entity_type="tenant_country",
        entity_id=None,
        tenant_id=tenant_id,
        old_data=old_data,
        new_data={
            "country_code": row.country_code,
            "currency_code": row.currency_code,
            "is_active": row.is_active
        }
    )

    return {
        "country_code": result.country_code,
        "country_name": result.country_name,
        "currency_code": result.currency_code,
        "is_active": result.is_active
    }




def soft_delete_tenant_country(db: Session, tenant_id, country_code,actor_user):
    row = (
        db.query(TenantCountry)
        .filter_by(
            tenant_id=tenant_id,
            country_code=country_code
        )
        .first()
    )

    if not row:
        raise HTTPException(404, "Country not found")

    old_data = {
        "country_code": row.country_code,
        "currency_code": row.currency_code,
        "is_active": row.is_active
    }
    row.is_active = False
    db.commit()
    # 🔐 AUDIT
    log_audit(
        db=db,
        actor_user=actor_user,
        action="TENANT_COUNTRY_DISABLED",
        entity_type="tenant_country",
        entity_id=None,
        tenant_id=tenant_id,
        old_data=old_data,
        new_data={"is_active": False}
    )
