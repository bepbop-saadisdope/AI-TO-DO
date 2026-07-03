"""FastAPI application entrypoint.

For the scaffold this only wires up CORS and a /health endpoint that proves the
app can actually reach Postgres. Todo routes are added in feature/todo-crud.

Run it:  uvicorn app.main:app --reload   (from the backend/ directory)
"""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

app = FastAPI(title="AI-Powered Todo", version="0.1.0")

# Allow the React dev server to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    """Liveness + DB connectivity check.

    Runs a trivial `SELECT 1` through a real session, so a 200 here means the
    API is up AND Postgres is reachable — exactly what we need to verify the
    scaffold end-to-end.
    """
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
