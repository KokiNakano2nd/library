from app.schemas.auth import CurrentUserResponse, LoginRequest, LoginResponse
from app.schemas.book import BookCreate, BookResponse
from app.schemas.error import ErrorResponse
from app.schemas.user import UserBootstrapRequest, UserResponse

__all__ = [
    "BookCreate",
    "BookResponse",
    "CurrentUserResponse",
    "ErrorResponse",
    "LoginRequest",
    "LoginResponse",
    "UserBootstrapRequest",
    "UserResponse",
]
