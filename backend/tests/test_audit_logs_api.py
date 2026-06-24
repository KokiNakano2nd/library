from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.repositories.user import create_user as create_user_repository
from app.schemas.user import UserBootstrapRequest
from app.services.auth import AUTH_COOKIE_NAME
from app.services.security import create_access_token, hash_password


def book_payload(
    title: str = "テスト駆動入門",
    author: str = "山田太郎",
    published_year: int | None = 2026,
    isbn: str | None = "test-isbn-001",
) -> dict[str, object]:
    return {
        "title": title,
        "author": author,
        "published_year": published_year,
        "isbn": isbn,
    }


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


def test_audit_logs_require_admin_role(
    client: TestClient,
    db_session: Session,
) -> None:
    unauthorized_response = client.get("/api/audit-logs")
    assert unauthorized_response.status_code == 401

    create_admin_and_login(client)
    member_auth = create_non_admin_user(db_session)
    client.cookies.clear()

    forbidden_response = client.get(
        "/api/audit-logs",
        headers={"Cookie": member_auth["cookie"]},
    )
    assert forbidden_response.status_code == 403


def test_audit_logs_can_be_listed_in_descending_order(client: TestClient) -> None:
    create_admin_and_login(client)

    create_response = client.post(
        "/api/books",
        json=book_payload(isbn="audit-list-001"),
    )
    assert create_response.status_code == 201
    created_book = create_response.json()

    update_response = client.put(
        f"/api/books/{created_book['id']}",
        json=book_payload(
            title="並び順確認後タイトル",
            author="並び順確認著者",
            published_year=2029,
            isbn="audit-list-002",
        ),
    )
    assert update_response.status_code == 200

    audit_logs_response = client.get("/api/audit-logs")
    assert audit_logs_response.status_code == 200
    audit_logs = audit_logs_response.json()

    assert len(audit_logs) == 2
    assert audit_logs[0]["action"] == "update"
    assert audit_logs[0]["target_title"] == "並び順確認後タイトル"
    assert audit_logs[1]["action"] == "create"
    assert audit_logs[1]["target_title"] == "テスト駆動入門"


def test_failed_write_operation_does_not_create_audit_log(
    client: TestClient,
    db_session: Session,
) -> None:
    create_admin_and_login(client)

    client.post("/api/books", json=book_payload(isbn="audit-failure-001"))
    duplicate_response = client.post(
        "/api/books", json=book_payload(isbn="audit-failure-001")
    )
    assert duplicate_response.status_code == 409

    audit_log_count = db_session.query(AuditLog).count()
    assert audit_log_count == 1
