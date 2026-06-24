from datetime import UTC, datetime
import json
import logging

import app.routers.books as books_router_module
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database import get_db
from app.main import app
from app.repositories.user import create_user as create_user_repository
from app.schemas.user import UserBootstrapRequest
from app.services.auth import AUTH_COOKIE_NAME
from app.services.security import create_access_token, hash_password


def bootstrap_admin_and_login(client: TestClient) -> None:
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


def create_member_cookie(db_session: Session) -> str:
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
    return f"{AUTH_COOKIE_NAME}={token}"


def test_success_response_contains_request_id_header(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] != ""


def test_authentication_error_response_is_standardized(client: TestClient) -> None:
    response = client.post(
        "/api/books",
        json={
            "title": "標準化テスト本",
            "author": "標準化著者",
            "published_year": 2026,
            "isbn": "error-format-001",
        },
    )

    assert response.status_code == 401
    assert response.json() == {
        "detail": "認証が必要です",
        "error_code": "authentication_required",
        "request_id": response.headers["X-Request-ID"],
    }


def test_authorization_error_response_is_standardized(
    client: TestClient,
    db_session: Session,
) -> None:
    bootstrap_admin_and_login(client)
    client.cookies.clear()
    member_cookie = create_member_cookie(db_session)

    response = client.post(
        "/api/books",
        json={
            "title": "権限エラーテスト本",
            "author": "権限エラー著者",
            "published_year": 2026,
            "isbn": "error-format-002",
        },
        headers={"Cookie": member_cookie},
    )

    assert response.status_code == 403
    assert response.json() == {
        "detail": "この操作は管理者だけが実行できます",
        "error_code": "admin_role_required",
        "request_id": response.headers["X-Request-ID"],
    }


def test_validation_error_response_is_standardized(client: TestClient) -> None:
    bootstrap_admin_and_login(client)

    response = client.post(
        "/api/books",
        json={
            "title": "   ",
            "author": "入力エラー著者",
            "published_year": 2026,
            "isbn": "error-format-003",
        },
    )

    body = response.json()
    assert response.status_code == 422
    assert body["detail"] == "入力内容を確認してください"
    assert body["error_code"] == "validation_error"
    assert body["request_id"] == response.headers["X-Request-ID"]
    assert len(body["errors"]) > 0


def test_unexpected_exception_returns_standardized_500(testing_session_local) -> None:
    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    def raise_runtime_error(_):
        raise RuntimeError("unexpected boom")

    app.dependency_overrides[get_db] = override_get_db

    previous_function = books_router_module.list_books
    books_router_module.list_books = raise_runtime_error
    try:
        with TestClient(app, raise_server_exceptions=False) as test_client:
            response = test_client.get("/api/books")
    finally:
        books_router_module.list_books = previous_function
        app.dependency_overrides.clear()

    assert response.status_code == 500
    assert response.json() == {
        "detail": "サーバー内部でエラーが発生しました",
        "error_code": "internal_server_error",
        "request_id": response.headers["X-Request-ID"],
    }


def test_request_completed_log_is_structured(
    client: TestClient,
    caplog,
) -> None:
    with caplog.at_level(logging.INFO, logger="library.api"):
        response = client.get("/health")

    assert response.status_code == 200

    request_logs = [
        json.loads(record.getMessage())
        for record in caplog.records
        if '"event": "request.completed"' in record.getMessage()
    ]
    assert len(request_logs) >= 1
    assert request_logs[-1]["path"] == "/health"
    assert request_logs[-1]["status_code"] == 200
    assert request_logs[-1]["request_id"] == response.headers["X-Request-ID"]
