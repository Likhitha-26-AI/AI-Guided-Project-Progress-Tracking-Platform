"""
Central app configuration. Reads from .env (see .env.example).
Nothing here is hardcoded data for the app itself — these are only
infrastructure settings (secrets, keys, URLs).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Security
    jwt_secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Hugging Face
    huggingface_api_key: str = ""
    huggingface_model: str = "HuggingFaceH4/zephyr-7b-beta"

    # GitHub OAuth
    github_client_id: str = ""
    github_client_secret: str = ""

    # Database
    database_url: str = "sqlite:///./app.db"

    # CORS
    frontend_origin: str = "http://localhost:5173"


settings = Settings()
