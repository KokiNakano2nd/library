from datetime import UTC, datetime
from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.schemas.user import UserBootstrapRequest
from app.services.auth import AUTH_COOKIE_NAME
from app.services.security import create_access_token, hash_password
from app.repositories.user import create_user as create_user_repository


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


def create_admin_and_login(client: TestClient) -> None:
    bootstrap_response = client.post(
        "/api/admin/bootstrap",
        json={
            "email": "admin@example.com",
            "username": "admin",
            "password": "AdminPass123",
        },
    )
    assert bootstrap_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={
            "login_id": "admin@example.com",
            "password": "AdminPass123",
        },
    )
    assert login_response.status_code == 200


def login_as_admin(client: TestClient) -> None:
    login_response = client.post(
        "/api/auth/login",
        json={
            "login_id": "admin@example.com",
            "password": "AdminPass123",
        },
    )
    assert login_response.status_code == 200


def create_non_admin_user(db_session: Session) -> dict[str, str]:
    user = create_user_repository(
        db_session,
        UserBootstrapRequest(
            email="member@example.com",
            username="member",
            password="MemberPass123",
        ),
        password_hash=hash_password("MemberPass123"),
        role="member",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    token, _ = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    return {
        "cookie": f"{AUTH_COOKIE_NAME}={token}",
        "role": user.role,
    }


def test_book_crud_flow(client: TestClient) -> None:
    create_admin_and_login(client)

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
    create_admin_and_login(client)

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
    create_admin_and_login(client)

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
    create_admin_and_login(client)

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


def test_list_and_detail_books_remain_public(client: TestClient) -> None:
    create_admin_and_login(client)
    created_book = create_book(client, isbn="public-read-isbn")

    client.cookies.clear()

    list_response = client.get("/api/books")
    assert list_response.status_code == 200

    detail_response = client.get(f"/api/books/{created_book['id']}")
    assert detail_response.status_code == 200


def test_write_operations_require_authentication(client: TestClient) -> None:
    create_response = client.post(
        "/api/books", json=book_payload(isbn="auth-required-001")
    )
    assert create_response.status_code == 401

    update_response = client.put(
        "/api/books/1", json=book_payload(isbn="auth-required-002")
    )
    assert update_response.status_code == 401

    delete_response = client.delete("/api/books/1")
    assert delete_response.status_code == 401


def test_non_admin_user_cannot_write_books(
    client: TestClient,
    db_session: Session,
) -> None:
    create_admin_and_login(client)
    member_auth = create_non_admin_user(db_session)
    client.cookies.clear()
    headers = {"Cookie": member_auth["cookie"]}

    create_response = client.post(
        "/api/books",
        json=book_payload(isbn="member-forbidden-001"),
        headers=headers,
    )
    assert create_response.status_code == 403
    assert create_response.json()["detail"] == "この操作は管理者だけが実行できます"

    login_as_admin(client)
    created_book = create_book(client, isbn="member-forbidden-002")
    client.cookies.clear()

    update_response = client.put(
        f"/api/books/{created_book['id']}",
        json=book_payload(isbn="member-forbidden-003"),
        headers=headers,
    )
    assert update_response.status_code == 403

    delete_response = client.delete(
        f"/api/books/{created_book['id']}",
        headers=headers,
    )
    assert delete_response.status_code == 403


def test_write_operations_create_audit_logs(client: TestClient) -> None:
    create_admin_and_login(client)

    created_book = create_book(client, isbn="audit-log-001")

    update_response = client.put(
        f"/api/books/{created_book['id']}",
        json=book_payload(
            title="監査ログ更新後タイトル",
            author="監査ログ著者",
            published_year=2028,
            isbn="audit-log-002",
        ),
    )
    assert update_response.status_code == 200

    delete_response = client.delete(f"/api/books/{created_book['id']}")
    assert delete_response.status_code == 204

    audit_logs_response = client.get("/api/audit-logs")
    assert audit_logs_response.status_code == 200

    audit_logs = audit_logs_response.json()
    assert [audit_log["action"] for audit_log in audit_logs] == [
        "delete",
        "update",
        "create",
    ]
    assert [audit_log["target_title"] for audit_log in audit_logs] == [
        "監査ログ更新後タイトル",
        "監査ログ更新後タイトル",
        "テスト駆動入門",
    ]
    assert all(audit_log["target_type"] == "book" for audit_log in audit_logs)
    assert all(
        audit_log["actor_email"] == "admin@example.com" for audit_log in audit_logs
    )
