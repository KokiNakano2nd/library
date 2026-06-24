from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User
from app.repositories.audit_log import (
    create_audit_log as create_audit_log_repository,
)
from app.repositories.audit_log import list_audit_logs as list_audit_logs_repository

BOOK_TARGET_TYPE = "book"
AUDIT_ACTION_CREATE = "create"
AUDIT_ACTION_UPDATE = "update"
AUDIT_ACTION_DELETE = "delete"


def list_audit_logs(db: Session) -> list[AuditLog]:
    return list_audit_logs_repository(db)


def record_book_audit_log(
    db: Session,
    actor: User | None,
    action: str,
    book_id: int,
    book_title: str,
) -> AuditLog:
    occurred_at = datetime.now(UTC)
    return create_audit_log_repository(
        db,
        actor_user_id=actor.id if actor is not None else None,
        actor_email=actor.email if actor is not None else None,
        action=action,
        target_type=BOOK_TARGET_TYPE,
        target_id=book_id,
        target_title=book_title,
        occurred_at=occurred_at,
    )
