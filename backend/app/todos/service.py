"""Business-logic layer for Todos."""

import uuid

from sqlalchemy.orm import Session

from app.todos.models import Priority, Status, Todo
from app.todos.repository import TodoRepository
from app.todos.schemas import TodoCreate, TodoUpdate


class TodoNotFoundError(Exception):
    """Exception raised when a todo is not found."""

    def __init__(self, todo_id: uuid.UUID):
        self.todo_id = todo_id
        super().__init__(f"Todo {todo_id} not found")


class TodoService:
    """Service layer class containing business logic for Todos."""

    def __init__(self, db: Session):
        self.repo = TodoRepository(db)

    def create(self, data: TodoCreate) -> Todo:
        """Create a Todo and handle any business validation rules."""
        return self.repo.create(data)

    def get(self, todo_id: uuid.UUID) -> Todo:
        """Retrieve a Todo by UUID, raising TodoNotFoundError if missing."""
        todo = self.repo.get(todo_id)
        if todo is None:
            raise TodoNotFoundError(todo_id)
        return todo

    def list(
        self,
        *,
        status: Status | None = None,
        priority: Priority | None = None,
        sort: str | None = None,
    ) -> list[Todo]:
        """Retrieve a filtered and sorted list of Todos."""
        return self.repo.list(status=status, priority=priority, sort=sort)

    def update(self, todo_id: uuid.UUID, data: TodoUpdate) -> Todo:
        """Update an existing Todo after verifying its existence."""
        todo = self.get(todo_id)
        return self.repo.update(todo, data)

    def delete(self, todo_id: uuid.UUID) -> None:
        """Delete an existing Todo after verifying its existence."""
        todo = self.get(todo_id)
        self.repo.delete(todo)


