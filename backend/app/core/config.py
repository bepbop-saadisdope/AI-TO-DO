"""Application configuration.

All settings come from environment variables (or a local .env file), never
hard-coded in the app. pydantic-settings validates and type-casts them for us.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Read from backend/.env if present; ignore unrelated env vars.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres connection string (psycopg3 driver). Overridable via DATABASE_URL.
    database_url: str = "postgresql+psycopg://todo:todo@localhost:5432/todo"

    # Origins allowed to call the API from a browser (React dev server default).
    cors_origins: list[str] = ["http://localhost:5173"]


# Single shared settings instance imported across the app.
settings = Settings()
