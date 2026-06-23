from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book import Book
from app.schemas.book import BookCreate, BookResponse, BookUpdate
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された本は見つかりません",
        ) from error


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book_endpoint(
    book_create: BookCreate,
    db: Session = Depends(get_db),
) -> Book:
    try:
        return create_book(db, book_create)
    except DuplicateIsbnError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="同じISBNの本がすでに登録されています",
        ) from error


@router.put("/{book_id}", response_model=BookResponse)
def update_book_endpoint(
    book_id: int,
    book_update: BookUpdate,
    db: Session = Depends(get_db),
) -> Book:
    try:
        return update_book(db, book_id, book_update)
    except BookNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された本は見つかりません",
        ) from error
    except DuplicateIsbnError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="同じISBNの本がすでに登録されています",
        ) from error


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_endpoint(
    book_id: int,
    db: Session = Depends(get_db),
) -> Response:
    try:
        delete_book(db, book_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except BookNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された本は見つかりません",
        ) from error
