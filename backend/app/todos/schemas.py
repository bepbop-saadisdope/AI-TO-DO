"""Pydantic schemas — the API's request/response contract.

These are DIFFERENT from the ORM model on purpose:
- The ORM `Todo` describes the database table.
- These schemas describe what the client may send and what we return.

Keeping them separate means the client can never set server-owned fields
(id, created_at, updated_at) and validation happens before we touch the DB.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.todos.models import Priority, Status


class TodoBase(BaseModel):
    """Fields a client is allowed to provide when creating a todo."""

    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None
    status: Status = Status.todo
    priority: Priority = Priority.medium
    tags: list[str] = Field(default_factory=list)


class TodoCreate(TodoBase):
    """Body for POST /api/todos. Same as base for now."""


class TodoUpdate(BaseModel):
    """Body for PATCH /api/todos/{id} — every field optional so callers can send
    a partial update. Only provided fields are changed."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None
    status: Status | None = None
    priority: Priority | None = None
    tags: list[str] | None = None


class TodoOut(TodoBase):
    """What the API returns. `from_attributes` lets us build it straight from an
    ORM `Todo` instance."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
