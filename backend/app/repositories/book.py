from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate


def get_book_by_isbn(db: Session, isbn: str) -> Book | None:
    statement = select(Book).where(Book.isbn == isbn)
    return db.scalars(statement).first()


def get_book_by_id(db: Session, book_id: int) -> Book | None:
    return db.get(Book, book_id)


def get_other_book_by_isbn(db: Session, isbn: str, book_id: int) -> Book | None:
    statement = select(Book).where(Book.isbn == isbn, Book.id != book_id)
    return db.scalars(statement).first()


def list_books(db: Session) -> list[Book]:
    statement = select(Book).order_by(Book.id)
    return list(db.scalars(statement).all())


def create_book(
    db: Session,
    book_create: BookCreate,
    created_at: datetime,
    updated_at: datetime,
) -> Book:
    book = Book(
        **book_create.model_dump(),
        created_at=created_at,
        updated_at=updated_at,
    )
    db.add(book)
    db.flush()
    return book


def update_book(
    db: Session,
    book: Book,
    book_update: BookUpdate,
    updated_at: datetime,
) -> Book:
    update_values = book_update.model_dump()

    for field_name, value in update_values.items():
        setattr(book, field_name, value)

    book.updated_at = updated_at
    db.flush()
    return book


def delete_book(db: Session, book: Book) -> None:
    db.delete(book)
    db.flush()
