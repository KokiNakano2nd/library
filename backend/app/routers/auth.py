from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import AuthenticationRequiredError
from app.models.user import User
from app.schemas.auth import CurrentUserResponse, LoginRequest, LoginResponse
from app.schemas.user import UserResponse
from app.services.auth import (
    AUTH_COOKIE_NAME,
    AuthenticationError,
    get_current_user,
    login_user,
)
from app.services.security import TOKEN_EXPIRATION_SECONDS

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login_endpoint(
    login_request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    try:
        user, access_token, expires_at = login_user(db, login_request)
    except AuthenticationError as error:
        raise AuthenticationRequiredError(
            detail="ログインIDまたはパスワードが正しくありません",
            error_code="invalid_credentials",
        ) from error

    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=TOKEN_EXPIRATION_SECONDS,
        expires=TOKEN_EXPIRATION_SECONDS,
    )
    return LoginResponse(
        user=UserResponse.model_validate(user),
        expires_at=expires_at,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_endpoint(response: Response) -> Response:
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=False,
    )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=CurrentUserResponse)
def me_endpoint(current_user: User = Depends(get_current_user)) -> CurrentUserResponse:
    return CurrentUserResponse(user=UserResponse.model_validate(current_user))
