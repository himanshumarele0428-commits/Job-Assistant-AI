from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./job_assistant.db"
    database_url_sync: str = "sqlite:///./job_assistant.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    secret_key: str = "change-this-to-a-random-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # AI
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Email
    sendgrid_api_key: Optional[str] = None
    from_email: str = "noreply@jobassistant.ai"
    smtp_host: str = "smtp.sendgrid.net"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None

    # Storage
    storage_type: str = "local"
    local_storage_path: str = "./uploads"

    # Google Sheets
    google_sheets_credentials_path: Optional[str] = None
    google_sheets_spreadsheet_id: Optional[str] = None

    # External APIs
    adzuna_app_id: Optional[str] = None
    adzuna_app_key: Optional[str] = None

    # App
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    api_v1_prefix: str = "/api"

    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache
def get_settings() -> Settings:
    return Settings()
