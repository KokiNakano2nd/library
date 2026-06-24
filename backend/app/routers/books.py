from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import ConflictError, ResourceNotFoundError
from app.models.book import Book
from app.models.user import User
from app.schemas.book import BookCreate, BookResponse, BookUpdate
from app.services.auth import require_admin_user
from app.services.book import (
    BookNotFoundError,
    DuplicateIsbnError,
    create_book,
    delete_book,
    get_book,
    list_books,
    update_book,
)

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("", response_model=list[BookResponse])
def list_books_endpoint(db: Session = Depends(get_db)) -> list[Book]:
    return list_books(db)


@router.get("/{book_id}", response_model=BookResponse)
def get_book_endpoint(
    book_id: int,
    db: Session = Depends(get_db),
) -> Book:
    try:
        return get_book(db, book_id)
    except BookNotFoundError as error:
        raise ResourceNotFoundError(
            detail="指定された本は見つかりません",
            error_code="book_not_found",
        ) from error


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book_endpoint(
    book_create: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_user),
) -> Book:
    try:
        return create_book(db, book_create, current_user)
    except DuplicateIsbnError as error:
        raise ConflictError(
            detail="同じISBNの本がすでに登録されています",
            error_code="duplicate_isbn",
        ) from error


@router.put("/{book_id}", response_model=BookResponse)
def update_book_endpoint(
    book_id: int,
    book_update: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_user),
) -> Book:
    try:
        return update_book(db, book_id, book_update, current_user)
    except BookNotFoundError as error:
        raise ResourceNotFoundError(
            detail="指定された本は見つかりません",
            error_code="book_not_found",
        ) from error
    except DuplicateIsbnError as error:
        raise ConflictError(
            detail="同じISBNの本がすでに登録されています",
            error_code="duplicate_isbn",
        ) from error


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_endpoint(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_user),
) -> Response:
    try:
        delete_book(db, book_id, current_user)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except BookNotFoundError as error:
        raise ResourceNotFoundError(
            detail="指定された本は見つかりません",
            error_code="book_not_found",
        ) from error
