from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""  # Service role key (secret key) for backend operations
    SUPABASE_PUBLISHABLE_KEY: str = ""  # Publishable key (optional, for reference)
    
    # JWT (for custom tokens if needed)
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # App
    DEBUG: bool = True
    
    class Config:
        env_file = [".env.local", ".env"]
        case_sensitive = True


settings = Settings()
