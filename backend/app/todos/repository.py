"""Data-access layer (the REPOSITORY).

This is the ONLY layer that talks to the database for todos. It knows about
SQLAlchemy, sessions, and queries — and nothing about HTTP. Everything above it
(service, router) calls these methods instead of writing queries themselves.

Why bother? Swapping storage, adding caching, or writing tests all become local
changes here instead of edits scattered across the app.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.todos.models import Priority, Status, Todo
from app.todos.schemas import TodoCreate, TodoUpdate

# Columns a client is allowed to sort by, mapped to the actual ORM column.
# Whitelisting prevents arbitrary/unsafe sort input.
_SORTABLE = {
    "due_date": Todo.due_date,
    "priority": Todo.priority,
    "status": Todo.status,
    "created_at": Todo.created_at,
}


class TodoRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: TodoCreate) -> Todo:
        # model_dump() turns the validated schema into a plain dict whose keys
        # already match the ORM column names.
        todo = Todo(**data.model_dump())
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)  # reload server-set fields (id, timestamps)
        return todo

    def get(self, todo_id: uuid.UUID) -> Todo | None:
        # Session.get() is a primary-key lookup; returns None if absent.
        return self.db.get(Todo, todo_id)

    def list(
        self,
        *,
        status: Status | None = None,
        priority: Priority | None = None,
        sort: str | None = None,
    ) -> list[Todo]:
        stmt = select(Todo)
        if status is not None:
            stmt = stmt.where(Todo.status == status)
        if priority is not None:
            stmt = stmt.where(Todo.priority == priority)
        # Default to newest-first; otherwise use the whitelisted sort column.
        column = _SORTABLE.get(sort, Todo.created_at)
        stmt = stmt.order_by(column)
        return list(self.db.scalars(stmt).all())

    def update(self, todo: Todo, data: TodoUpdate) -> Todo:
        # exclude_unset=True → only fields the client actually sent are applied,
        # which is exactly PATCH (partial update) semantics.
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(todo, field, value)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete(self, todo: Todo) -> None:
        self.db.delete(todo)
        self.db.commit()
