from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserBootstrapRequest, UserResponse
from app.services.user import (
    BootstrapAlreadyCompletedError,
    DuplicateUserIdentifierError,
    bootstrap_admin_user,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post(
    "/bootstrap",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def bootstrap_admin_endpoint(
    user_create: UserBootstrapRequest,
    db: Session = Depends(get_db),
) -> User:
    try:
        return bootstrap_admin_user(db, user_create)
    except BootstrapAlreadyCompletedError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="初期管理者の作成は完了済みです",
        ) from error
    except DuplicateUserIdentifierError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="同じ email または username の利用者が既に存在します",
        ) from error
