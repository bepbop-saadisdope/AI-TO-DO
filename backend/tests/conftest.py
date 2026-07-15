"""Shared pytest fixtures.

Two layers of isolation so tests are deterministic and never touch dev data:

1. A DEDICATED test database (`todo_test`), created automatically if missing.
   Tests never run against the real `todo` dev database.
2. Each test runs inside a transaction we ROLL BACK afterwards, so tests don't
   interfere with each other. SQLAlchemy 2.0's
   `join_transaction_mode="create_savepoint"` makes the repository's commit()
   calls release a SAVEPOINT instead of the outer transaction, so our rollback
   still wipes everything the test did.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app
from app.todos import models  # noqa: F401  (register the Todo table on Base)

# Derive the test DB URL from the dev one by swapping the database name.
_base_url, _, _dev_db = settings.database_url.rpartition("/")
TEST_DATABASE_URL = f"{_base_url}/todo_test"


def _ensure_test_database() -> None:
    """CREATE DATABASE todo_test if it doesn't exist (connect to the default
    `postgres` maintenance DB; CREATE DATABASE can't run inside a transaction)."""
    admin = create_engine(f"{_base_url}/postgres", isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = 'todo_test'")
        ).scalar()
        if not exists:
            conn.execute(text("CREATE DATABASE todo_test"))
    admin.dispose()


# Engine pointed at the isolated test database.
_ensure_test_database()
test_engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)


@pytest.fixture(scope="session", autouse=True)
def _schema():
    # Build the schema (table + enum types) once for the whole test session.
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session):
    # Point the app's get_db dependency at our rolled-back test session.
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
