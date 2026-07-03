"""The Todo ORM model — the single source of truth for the `todos` table.

This is the DATA layer's schema. Everything above it (repository, service, router)
speaks in terms of this class and never writes raw SQL for these columns.

Fields mirror the spec's data model exactly (§2.2). We use Postgres-native types
(UUID, ARRAY, ENUM) because we're committed to Postgres from Phase 1.
"""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SAEnum, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Status(str, enum.Enum):
    """Allowed values for a todo's status. Inheriting from `str` makes it
    JSON-serialisable and comparable to plain strings."""

    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class Priority(str, enum.Enum):
    """Allowed values for a todo's priority."""

    low = "low"
    medium = "medium"
    high = "high"


class Todo(Base):
    __tablename__ = "todos"

    # Server-generated UUID primary key (not a guessable auto-increment int).
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Required, 1–200 chars. Length is enforced here (DB) AND in the Pydantic schema.
    title: Mapped[str] = mapped_column(String(200), nullable=False)

    # Optional free text.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Optional calendar date (no time component).
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Constrained to the enum values above; stored as a Postgres ENUM type.
    status: Mapped[Status] = mapped_column(
        SAEnum(Status, name="todo_status"), default=Status.todo, nullable=False
    )
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="todo_priority"), default=Priority.medium, nullable=False
    )

    # List of short labels; Postgres native text[] array. Defaults to empty list.
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )

    # Timestamps set by the database clock, not the app/client.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # Refreshed on every UPDATE that goes through the ORM.
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
