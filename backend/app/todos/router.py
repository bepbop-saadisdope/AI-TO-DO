"""HTTP layer (the ROUTER).

Thin on purpose: it parses/validates the request (via type hints + Pydantic),
delegates to the service, and maps results — and domain errors — to HTTP status
codes. No business logic and no database access live here.

Status codes (spec §2.3): 201 on create, 404 on missing, 422 on validation
error (FastAPI returns 422 automatically when the body/params fail validation).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.todos.models import Priority, Status
from app.todos.schemas import TodoCreate, TodoOut, TodoUpdate
from app.todos.service import TodoNotFoundError, TodoService

router = APIRouter(prefix="/api/todos", tags=["todos"])


def get_service(db: Session = Depends(get_db)) -> TodoService:
    """Dependency that builds a TodoService bound to this request's DB session."""
    return TodoService(db)


@router.get("", response_model=list[TodoOut])
def list_todos(
    status: Status | None = Query(default=None, description="Filter by status"),
    priority: Priority | None = Query(default=None, description="Filter by priority"),
    sort: str | None = Query(
        default=None, description="Sort by: due_date | priority | status | created_at"
    ),
    service: TodoService = Depends(get_service),
) -> list[TodoOut]:
    return service.list(status=status, priority=priority, sort=sort)


@router.post("", response_model=TodoOut, status_code=http_status.HTTP_201_CREATED)
def create_todo(
    data: TodoCreate, service: TodoService = Depends(get_service)
) -> TodoOut:
    return service.create(data)


@router.get("/{todo_id}", response_model=TodoOut)
def get_todo(
    todo_id: uuid.UUID, service: TodoService = Depends(get_service)
) -> TodoOut:
    try:
        return service.get(todo_id)
    except TodoNotFoundError:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Todo not found")


@router.patch("/{todo_id}", response_model=TodoOut)
def update_todo(
    todo_id: uuid.UUID, data: TodoUpdate, service: TodoService = Depends(get_service)
) -> TodoOut:
    try:
        return service.update(todo_id, data)
    except TodoNotFoundError:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Todo not found")


@router.delete("/{todo_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: uuid.UUID, service: TodoService = Depends(get_service)
) -> None:
    try:
        service.delete(todo_id)
    except TodoNotFoundError:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Todo not found")
