from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserBootstrapRequest


def count_users(db: Session) -> int:
    statement = select(func.count()).select_from(User)
    return db.scalar(statement) or 0


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.scalars(statement).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    return db.scalars(statement).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    statement = select(User).where(User.id == user_id)
    return db.scalars(statement).first()


def create_user(
    db: Session,
    user_create: UserBootstrapRequest,
    password_hash: str,
    role: str,
    created_at: datetime,
    updated_at: datetime,
) -> User:
    user = User(
        email=user_create.email,
        username=user_create.username,
        password_hash=password_hash,
        role=role,
        is_active=True,
        created_at=created_at,
        updated_at=updated_at,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
