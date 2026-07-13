"""The Todo ORM model mapping to the `todos` table."""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SAEnum, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Status(str, enum.Enum):
    """Allowed values for a todo's status."""

    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class Priority(str, enum.Enum):
    """Allowed values for a todo's priority."""

    low = "low"
    medium = "medium"
    high = "high"


class Todo(Base):
    """SQLAlchemy model representing a Todo task item."""

    __tablename__ = "todos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[Status] = mapped_column(
        SAEnum(Status, name="todo_status"), default=Status.todo, nullable=False
    )
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="todo_priority"), default=Priority.medium, nullable=False
    )
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

