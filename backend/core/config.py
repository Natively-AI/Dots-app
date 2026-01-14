from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/dots"
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""  # Service role key (secret key) for backend operations
    SUPABASE_PUBLISHABLE_KEY: str = ""  # Publishable key (optional, for reference)
    
    # JWT (for custom tokens if needed)
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Allow all localhost ports for development
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    # App
    DEBUG: bool = True
    
    class Config:
        env_file = [".env.local", ".env"]
        case_sensitive = True


settings = Settings()
