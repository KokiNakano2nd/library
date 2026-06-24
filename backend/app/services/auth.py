from datetime import UTC, datetime

from fastapi import Cookie, Depends, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import AuthenticationRequiredError, AuthorizationError
from app.models.user import User
from app.repositories.user import (
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
)
from app.schemas.auth import LoginRequest
from app.services.security import (
    create_access_token,
    decode_access_token,
    verify_password,
)

AUTH_COOKIE_NAME = "library_access_token"
ADMIN_ROLE = "admin"


class AuthenticationError(Exception):
    pass


def login_user(db: Session, login_request: LoginRequest) -> tuple[User, str, datetime]:
    user = _find_user_for_login(db, login_request.login_id)
    if user is None:
        raise AuthenticationError()

    if not user.is_active:
        raise AuthenticationError()

    if not verify_password(login_request.password, user.password_hash):
        raise AuthenticationError()

    token, expires_at = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    return user, token, datetime.fromtimestamp(expires_at, tz=UTC)


def get_current_user(
    authorization: str | None = Header(default=None),
    access_token_cookie: str | None = Cookie(default=None, alias=AUTH_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
    token = _extract_access_token(authorization, access_token_cookie)

    try:
        payload = decode_access_token(token)
    except ValueError as error:
        raise AuthenticationRequiredError() from error

    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id.isdigit():
        raise AuthenticationRequiredError()

    user = get_user_by_id(db, int(user_id))
    if user is None or not user.is_active:
        raise AuthenticationRequiredError()

    return user


def require_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != ADMIN_ROLE:
        raise AuthorizationError()

    return current_user


def _find_user_for_login(db: Session, login_id: str) -> User | None:
    user = get_user_by_email(db, login_id)
    if user is not None:
        return user
    return get_user_by_username(db, login_id)


def _extract_access_token(
    authorization: str | None,
    access_token_cookie: str | None,
) -> str:
    if authorization is not None and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        if token != "":
            return token

    if access_token_cookie is not None and access_token_cookie.strip() != "":
        return access_token_cookie.strip()

    raise AuthenticationRequiredError()
