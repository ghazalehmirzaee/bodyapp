"""
Configuration Module
"""
import os
from typing import List


class Settings:
    """Application settings"""
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    RELOAD: bool = os.getenv("RELOAD", "true").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://localhost:3001"
    ).split(",")
    
    # API settings
    API_PREFIX: str = "/api"
    API_VERSION: str = "1.0.0"
    API_TITLE: str = "Body Composition Scanner API"
    API_DESCRIPTION: str = "AI-powered body analysis, diet planning, and workout generation"


settings = Settings()

