from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogResponse
from app.services.audit_log import list_audit_logs
from app.services.auth import require_admin_user

router = APIRouter(prefix="/api/audit-logs", tags=["audit-logs"])


@router.get("", response_model=list[AuditLogResponse])
def list_audit_logs_endpoint(
    db: Session = Depends(get_db),
    _: object = Depends(require_admin_user),
) -> list[AuditLog]:
    return list_audit_logs(db)
