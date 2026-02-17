from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_audit(
    db: Session,
    *,
    actor_user,
    action: str,
    entity_type: str | None = None,
    entity_id=None,
    tenant_id=None,
    old_data=None,
    new_data=None,
    ip_address: str | None = None,
    user_agent: str | None = None
):
    log = AuditLog(
        actor_user_id=actor_user.user_id,
        actor_role_id=actor_user.role_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        tenant_id=tenant_id,
        old_data=old_data,
        new_data=new_data,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    db.add(log)
    db.commit()
