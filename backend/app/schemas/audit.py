from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actor_user_id: int | None
    actor_email: str | None
    action: str
    target_type: str
    target_id: int
    target_title: str
    occurred_at: datetime
