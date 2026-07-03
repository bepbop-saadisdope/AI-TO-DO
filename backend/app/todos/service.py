"""Business-logic layer (the SERVICE).

Sits between the router (HTTP) and the repository (DB). It enforces domain rules
and decides what "not found" means — but it raises a plain domain exception, NOT
an HTTP error. Translating that into a 404 is the router's job. This keeps HTTP
concerns out of the business logic, so the service could be reused from a CLI,
a background job, or the Phase 3 agent without change.
"""

import uuid

from sqlalchemy.orm import Session

from app.todos.models import Priority, Status, Todo
from app.todos.repository import TodoRepository
from app.todos.schemas import TodoCreate, TodoUpdate


class TodoNotFoundError(Exception):
    """A todo with the given id does not exist. Router maps this to HTTP 404."""

    def __init__(self, todo_id: uuid.UUID):
        self.todo_id = todo_id
        super().__init__(f"Todo {todo_id} not found")


class TodoService:
    def __init__(self, db: Session):
        self.repo = TodoRepository(db)

    def create(self, data: TodoCreate) -> Todo:
        return self.repo.create(data)

    def get(self, todo_id: uuid.UUID) -> Todo:
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
        return self.repo.list(status=status, priority=priority, sort=sort)

    def update(self, todo_id: uuid.UUID, data: TodoUpdate) -> Todo:
        # Reuse get() so the not-found rule lives in exactly one place.
        todo = self.get(todo_id)
        return self.repo.update(todo, data)

    def delete(self, todo_id: uuid.UUID) -> None:
        todo = self.get(todo_id)
        self.repo.delete(todo)
