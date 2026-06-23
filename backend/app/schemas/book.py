from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=255)
    published_year: int | None = Field(default=None, ge=1)
    isbn: str | None = Field(default=None, max_length=20)

    @field_validator("title", "author")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if stripped_value == "":
            raise ValueError("空白だけの入力はできません")
        return stripped_value

    @field_validator("isbn", mode="before")
    @classmethod
    def normalize_isbn(cls, value: Any) -> Any:
        if isinstance(value, str):
            stripped_value = value.strip()
            if stripped_value == "":
                return None
            return stripped_value
        return value


class BookUpdate(BookCreate):
    pass


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author: str
    published_year: int | None
    isbn: str | None
    created_at: datetime
    updated_at: datetime
