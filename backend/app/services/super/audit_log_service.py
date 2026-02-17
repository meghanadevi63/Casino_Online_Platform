from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.audit_log import AuditLog


def get_audit_logs(
    db: Session,
    limit: int = 50,
    tenant_id=None
):
    q = db.query(AuditLog)

    if tenant_id:
        q = q.filter(AuditLog.tenant_id == tenant_id)

    return (
        q.order_by(desc(AuditLog.created_at))
        .limit(limit)
        .all()
    )
