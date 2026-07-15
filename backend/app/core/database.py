"""Database plumbing: engine, session factory, ORM base, and the get_db dependency.

This is the seam between the app and Postgres. Nothing above the data-access
layer should import the engine directly — routes/services get a Session via the
`get_db` FastAPI dependency instead.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# One engine per process. pool_pre_ping avoids handing out dead connections
# (e.g. after Postgres restarts).
engine = create_engine(settings.database_url, pool_pre_ping=True, echo=False)

# Session factory. Each request gets its own short-lived Session.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Base class every ORM model inherits from (models arrive in feature/todo-model)."""


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a Session and guarantees it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
