from typing import Any

from fastapi.testclient import TestClient


def book_payload(
    title: str = "テスト駆動入門",
    author: str = "山田太郎",
    published_year: int | None = 2026,
    isbn: str | None = "test-isbn-001",
) -> dict[str, Any]:
    return {
        "title": title,
        "author": author,
        "published_year": published_year,
        "isbn": isbn,
    }


def create_book(client: TestClient, isbn: str = "test-isbn-001") -> dict[str, Any]:
    response = client.post(
        "/api/books",
        json=book_payload(isbn=isbn),
    )
    assert response.status_code == 201
    return response.json()


def test_book_crud_flow(client: TestClient) -> None:
    created_book = create_book(client)
    book_id = created_book["id"]

    list_response = client.get("/api/books")
    assert list_response.status_code == 200
    assert [book["id"] for book in list_response.json()] == [book_id]

    get_response = client.get(f"/api/books/{book_id}")
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "テスト駆動入門"

    update_response = client.put(
        f"/api/books/{book_id}",
        json=book_payload(
            title="更新後のタイトル",
            author="佐藤花子",
            published_year=2027,
            isbn="test-isbn-002",
        ),
    )
    assert update_response.status_code == 200
    updated_book = update_response.json()
    assert updated_book["title"] == "更新後のタイトル"
    assert updated_book["isbn"] == "test-isbn-002"

    delete_response = client.delete(f"/api/books/{book_id}")
    assert delete_response.status_code == 204
    assert delete_response.content == b""

    get_deleted_response = client.get(f"/api/books/{book_id}")
    assert get_deleted_response.status_code == 404


def test_missing_book_returns_404(client: TestClient) -> None:
    missing_id = 999999

    get_response = client.get(f"/api/books/{missing_id}")
    assert get_response.status_code == 404

    update_response = client.put(
        f"/api/books/{missing_id}",
        json=book_payload(isbn="missing-update-isbn"),
    )
    assert update_response.status_code == 404

    delete_response = client.delete(f"/api/books/{missing_id}")
    assert delete_response.status_code == 404


def test_invalid_input_returns_422(client: TestClient) -> None:
    blank_title_response = client.post(
        "/api/books",
        json=book_payload(title="   ", isbn="invalid-title-isbn"),
    )
    assert blank_title_response.status_code == 422

    invalid_year_response = client.post(
        "/api/books",
        json=book_payload(published_year=0, isbn="invalid-year-isbn"),
    )
    assert invalid_year_response.status_code == 422


def test_duplicate_isbn_returns_409(client: TestClient) -> None:
    first_book = create_book(client, isbn="duplicate-isbn-001")
    second_book = create_book(client, isbn="duplicate-isbn-002")

    duplicate_create_response = client.post(
        "/api/books",
        json=book_payload(isbn=first_book["isbn"]),
    )
    assert duplicate_create_response.status_code == 409

    duplicate_update_response = client.put(
        f"/api/books/{second_book['id']}",
        json=book_payload(isbn=first_book["isbn"]),
    )
    assert duplicate_update_response.status_code == 409
