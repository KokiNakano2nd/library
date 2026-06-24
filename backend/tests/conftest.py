from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models.audit_log import AuditLog
from app.main import app
from app.models.book import Book
from app.models.user import User


@pytest.fixture
def test_engine() -> Generator[Engine, None, None]:
    engine = create_test_engine()
    Base.metadata.create_all(bind=engine)
    try:
        yield engine
    finally:
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def testing_session_local(
    test_engine: Engine,
) -> sessionmaker[Session]:
    return sessionmaker(
        bind=test_engine,
        autocommit=False,
        autoflush=False,
    )


@pytest.fixture
def db_session(
    testing_session_local: sessionmaker[Session],
) -> Generator[Session, None, None]:
    db = testing_session_local()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(
    testing_session_local: sessionmaker[Session],
) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def create_test_engine() -> Engine:
    return create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


_ = Book
_ = User
_ = AuditLog
