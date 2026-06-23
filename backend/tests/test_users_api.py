from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.security import hash_password
from app.services.security import verify_password


def bootstrap_payload(
    email: str = "admin@example.com",
    username: str = "admin",
    password: str = "AdminPass123",
) -> dict[str, str]:
    return {
        "email": email,
        "username": username,
        "password": password,
    }


def test_bootstrap_admin_user_creates_hashed_password(
    client: TestClient,
    db_session: Session,
) -> None:
    client.app.dependency_overrides.clear()

    def override_get_db() -> Session:
        try:
            yield db_session
        finally:
            pass

    from app.database import get_db

    client.app.dependency_overrides[get_db] = override_get_db

    response = client.post(
        "/api/admin/bootstrap",
        json=bootstrap_payload(),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "admin@example.com"
    assert body["username"] == "admin"
    assert body["role"] == "admin"
    assert body["is_active"] is True
    assert "password_hash" not in body

    user = db_session.query(User).one()
    assert user.password_hash != "AdminPass123"
    assert verify_password("AdminPass123", user.password_hash) is True


def test_bootstrap_admin_user_can_run_only_once(client: TestClient) -> None:
    first_response = client.post(
        "/api/admin/bootstrap",
        json=bootstrap_payload(),
    )
    assert first_response.status_code == 201

    second_response = client.post(
        "/api/admin/bootstrap",
        json=bootstrap_payload(
            email="second@example.com",
            username="second-admin",
        ),
    )
    assert second_response.status_code == 409


def test_bootstrap_admin_user_validates_input(client: TestClient) -> None:
    response = client.post(
        "/api/admin/bootstrap",
        json=bootstrap_payload(password="short"),
    )

    assert response.status_code == 422


def test_verify_password_matches_hashed_value() -> None:
    password = "AdminPass123"
    password_hash = hash_password(password)

    assert password_hash != password
    assert verify_password(password, password_hash) is True
    assert verify_password("WrongPass123", password_hash) is False
