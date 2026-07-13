"""Data-access layer for Todos."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.todos.models import Priority, Status, Todo
from app.todos.schemas import TodoCreate, TodoUpdate

_SORTABLE = {
    "due_date": Todo.due_date,
    "priority": Todo.priority,
    "status": Todo.status,
    "created_at": Todo.created_at,
}


class TodoRepository:
    """Repository for executing database CRUD operations on Todo records."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: TodoCreate) -> Todo:
        """Create a new Todo record in the database."""
        todo = Todo(**data.model_dump())
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def get(self, todo_id: uuid.UUID) -> Todo | None:
        """Retrieve a Todo record by its unique UUID identifier."""
        return self.db.get(Todo, todo_id)

    def list(
        self,
        *,
        status: Status | None = None,
        priority: Priority | None = None,
        sort: str | None = None,
    ) -> list[Todo]:
        """List Todo records with optional filtering and sorting."""
        stmt = select(Todo)
        if status is not None:
            stmt = stmt.where(Todo.status == status)
        if priority is not None:
            stmt = stmt.where(Todo.priority == priority)
        column = _SORTABLE.get(sort, Todo.created_at)
        stmt = stmt.order_by(column)
        return list(self.db.scalars(stmt).all())

    def update(self, todo: Todo, data: TodoUpdate) -> Todo:
        """Perform a partial update on an existing Todo record."""
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(todo, field, value)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete(self, todo: Todo) -> None:
        """Delete a Todo record from the database."""
        self.db.delete(todo)
        self.db.commit()


