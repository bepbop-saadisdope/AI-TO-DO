"""Pydantic schemas for the Todo API."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.todos.models import Priority, Status


class TodoBase(BaseModel):
    """Base validation schema for a Todo."""

    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None
    status: Status = Status.todo
    priority: Priority = Priority.medium
    tags: list[str] = Field(default_factory=list)


class TodoCreate(TodoBase):
    """Validation schema for creating a Todo."""


class TodoUpdate(BaseModel):
    """Validation schema for updating a Todo."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None
    status: Status | None = None
    priority: Priority | None = None
    tags: list[str] | None = None


class TodoOut(TodoBase):
    """Response serialization schema for a Todo."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

