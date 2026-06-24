from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    actor_user_id: int | None,
    actor_email: str | None,
    action: str,
    target_type: str,
    target_id: int,
    target_title: str,
    occurred_at: datetime,
) -> AuditLog:
    audit_log = AuditLog(
        actor_user_id=actor_user_id,
        actor_email=actor_email,
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_title=target_title,
        occurred_at=occurred_at,
    )
    db.add(audit_log)
    db.flush()
    db.refresh(audit_log)
    return audit_log


def list_audit_logs(db: Session) -> list[AuditLog]:
    statement = select(AuditLog).order_by(
        AuditLog.occurred_at.desc(), AuditLog.id.desc()
    )
    return list(db.scalars(statement).all())
