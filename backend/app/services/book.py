from datetime import UTC, datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.book import Book
from app.repositories.book import create_book as create_book_repository
from app.repositories.book import delete_book as delete_book_repository
from app.repositories.book import get_book_by_id as get_book_by_id_repository
from app.repositories.book import get_book_by_isbn
from app.repositories.book import get_other_book_by_isbn
from app.repositories.book import list_books as list_books_repository
from app.repositories.book import update_book as update_book_repository
from app.schemas.book import BookCreate, BookUpdate


class DuplicateIsbnError(Exception):
    pass


class BookNotFoundError(Exception):
    pass


def list_books(db: Session) -> list[Book]:
    return list_books_repository(db)


def get_book(db: Session, book_id: int) -> Book:
    book = get_book_by_id_repository(db, book_id)

    if book is None:
        raise BookNotFoundError()

    return book


def create_book(db: Session, book_create: BookCreate) -> Book:
    if (
        book_create.isbn is not None
        and get_book_by_isbn(db, book_create.isbn) is not None
    ):
        raise DuplicateIsbnError()

    now = datetime.now(UTC)

    try:
        return create_book_repository(
            db,
            book_create,
            created_at=now,
            updated_at=now,
        )
    except IntegrityError as error:
        db.rollback()
        raise DuplicateIsbnError() from error


def delete_book(db: Session, book_id: int) -> None:
    book = get_book(db, book_id)
    delete_book_repository(db, book)


def update_book(db: Session, book_id: int, book_update: BookUpdate) -> Book:
    book = get_book(db, book_id)

    if (
        book_update.isbn is not None
        and get_other_book_by_isbn(db, book_update.isbn, book_id) is not None
    ):
        raise DuplicateIsbnError()

    now = datetime.now(UTC)

    try:
        return update_book_repository(
            db,
            book,
            book_update,
            updated_at=now,
        )
    except IntegrityError as error:
        db.rollback()
        raise DuplicateIsbnError() from error
