from fastapi.testclient import TestClient

from app.services.auth import AUTH_COOKIE_NAME


def bootstrap_payload() -> dict[str, str]:
    return {
        "email": "admin@example.com",
        "username": "admin",
        "password": "AdminPass123",
    }


def login_payload(
    login_id: str = "admin@example.com",
    password: str = "AdminPass123",
) -> dict[str, str]:
    return {
        "login_id": login_id,
        "password": password,
    }


def bootstrap_admin_user(client: TestClient) -> None:
    response = client.post("/api/admin/bootstrap", json=bootstrap_payload())
    assert response.status_code == 201


def test_login_returns_cookie_and_me_returns_current_user(client: TestClient) -> None:
    bootstrap_admin_user(client)

    login_response = client.post("/api/auth/login", json=login_payload())

    assert login_response.status_code == 200
    body = login_response.json()
    assert body["user"]["email"] == "admin@example.com"
    assert body["user"]["username"] == "admin"
    assert "expires_at" in body
    assert AUTH_COOKIE_NAME in login_response.cookies

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["user"]["email"] == "admin@example.com"


def test_login_allows_username_as_login_id(client: TestClient) -> None:
    bootstrap_admin_user(client)

    response = client.post(
        "/api/auth/login",
        json=login_payload(login_id="admin"),
    )

    assert response.status_code == 200


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    bootstrap_admin_user(client)

    response = client.post(
        "/api/auth/login",
        json=login_payload(password="WrongPassword123"),
    )

    assert response.status_code == 401


def test_logout_clears_cookie_and_blocks_me(client: TestClient) -> None:
    bootstrap_admin_user(client)

    login_response = client.post("/api/auth/login", json=login_payload())
    assert login_response.status_code == 200

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 204

    client.cookies.clear()
    unauthenticated_me_response = client.get("/api/auth/me")
    assert unauthenticated_me_response.status_code == 401
