from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    login_id: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("login_id", "password")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if stripped_value == "":
            raise ValueError("必須項目は空文字にできません")
        return stripped_value

    @field_validator("login_id")
    @classmethod
    def normalize_login_id(cls, value: str) -> str:
        return value.lower()


class LoginResponse(BaseModel):
    user: UserResponse
    expires_at: datetime


class CurrentUserResponse(BaseModel):
    user: UserResponse
