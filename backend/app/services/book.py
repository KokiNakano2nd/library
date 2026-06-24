from datetime import UTC, datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.book import Book
from app.models.user import User
from app.repositories.book import create_book as create_book_repository
from app.repositories.book import delete_book as delete_book_repository
from app.repositories.book import get_book_by_id as get_book_by_id_repository
from app.repositories.book import get_book_by_isbn
from app.repositories.book import get_other_book_by_isbn
from app.repositories.book import list_books as list_books_repository
from app.repositories.book import update_book as update_book_repository
from app.schemas.book import BookCreate, BookUpdate
from app.services.audit_log import (
    AUDIT_ACTION_CREATE,
    AUDIT_ACTION_DELETE,
    AUDIT_ACTION_UPDATE,
    record_book_audit_log,
)


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


def create_book(db: Session, book_create: BookCreate, actor: User) -> Book:
    if (
        book_create.isbn is not None
        and get_book_by_isbn(db, book_create.isbn) is not None
    ):
        raise DuplicateIsbnError()

    now = datetime.now(UTC)

    try:
        book = create_book_repository(
            db,
            book_create,
            created_at=now,
            updated_at=now,
        )
        record_book_audit_log(
            db,
            actor=actor,
            action=AUDIT_ACTION_CREATE,
            book_id=book.id,
            book_title=book.title,
        )
        db.commit()
        db.refresh(book)
        return book
    except IntegrityError as error:
        db.rollback()
        raise DuplicateIsbnError() from error


def delete_book(db: Session, book_id: int, actor: User) -> None:
    book = get_book(db, book_id)
    delete_book_repository(db, book)
    record_book_audit_log(
        db,
        actor=actor,
        action=AUDIT_ACTION_DELETE,
        book_id=book.id,
        book_title=book.title,
    )
    db.commit()


def update_book(
    db: Session, book_id: int, book_update: BookUpdate, actor: User
) -> Book:
    book = get_book(db, book_id)

    if (
        book_update.isbn is not None
        and get_other_book_by_isbn(db, book_update.isbn, book_id) is not None
    ):
        raise DuplicateIsbnError()

    now = datetime.now(UTC)

    try:
        updated_book = update_book_repository(
            db,
            book,
            book_update,
            updated_at=now,
        )
        record_book_audit_log(
            db,
            actor=actor,
            action=AUDIT_ACTION_UPDATE,
            book_id=updated_book.id,
            book_title=updated_book.title,
        )
        db.commit()
        db.refresh(updated_book)
        return updated_book
    except IntegrityError as error:
        db.rollback()
        raise DuplicateIsbnError() from error
