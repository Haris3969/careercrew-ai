from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str = ""
    gemini_api_key: str = ""

    database_url: str
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    adzuna_app_id: str
    adzuna_app_key: str

    upstash_redis_rest_url: str
    upstash_redis_rest_token: str

    environment: str = "development"
    api_port: int = 8000
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()