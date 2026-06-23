from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user import count_users
from app.repositories.user import create_user as create_user_repository
from app.repositories.user import get_user_by_email, get_user_by_username
from app.schemas.user import UserBootstrapRequest
from app.services.security import hash_password

ADMIN_ROLE = "admin"


class BootstrapAlreadyCompletedError(Exception):
    pass


class DuplicateUserIdentifierError(Exception):
    pass


def bootstrap_admin_user(db: Session, user_create: UserBootstrapRequest) -> User:
    if count_users(db) > 0:
        raise BootstrapAlreadyCompletedError()

    if get_user_by_email(db, user_create.email) is not None:
        raise DuplicateUserIdentifierError()

    if get_user_by_username(db, user_create.username) is not None:
        raise DuplicateUserIdentifierError()

    now = datetime.now(UTC)

    return create_user_repository(
        db,
        user_create,
        password_hash=hash_password(user_create.password),
        role=ADMIN_ROLE,
        created_at=now,
        updated_at=now,
    )
