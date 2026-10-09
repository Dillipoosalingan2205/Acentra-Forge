from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic Hospital Discharge & Follow-up Coordinator"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./carecoord.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8080",
        "*"
    ]
    
    # Optional LLM API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Clinical Safety
    SAFETY_DISCLAIMER: str = (
        "This tool organizes discharge instructions but does NOT diagnose, "
        "change medications, or recommend treatments. Always follow your "
        "treating physician's advice. In case of emergency, call emergency services immediately."
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
