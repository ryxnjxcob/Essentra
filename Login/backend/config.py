"""
Configuration management for the login system.
Handles environment variables and app settings.
"""

import os
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./auth.db"

    # JWT Configuration
    jwt_secret_key: str = (
        "9d802a0c19ffbc85fef0661e6846dd0585af4a495561724f29e5f0239a5f9b33"
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Email (SMTP)
    smtp_email: str = "essentranotes@gmail.com"
    smtp_password: str = "mtsowkjienaeylzv"
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587

    # Security
    bcrypt_rounds: int = 12
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 15

    zhipu_api_key: str | None = None

    # Password Reset
    reset_token_expire_minutes: int = 30

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_period_minutes: int = 15

    # Environment
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "forbid"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
