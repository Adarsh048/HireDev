import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "DevLaunch API"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "5000"))
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/devlaunch")
    
    # JWT Secrets
    JWT_ACCESS_SECRET: str = os.getenv(
        "JWT_ACCESS_SECRET", "devlaunch_jwt_access_secret_key_super_secure_32_chars"
    )
    JWT_REFRESH_SECRET: str = os.getenv(
        "JWT_REFRESH_SECRET", "devlaunch_jwt_refresh_secret_key_super_secure_32_chars"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRY_MINUTES: int = 60 * 24  # 1 day
    JWT_REFRESH_EXPIRY_DAYS: int = 7
    
    # CORS
    CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "*")
    
    # Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = 10
    
    # Matching weights (calibrated for >= 80% matches)
    WEIGHT_SEMANTIC: float = 0.30
    WEIGHT_SKILLS: float = 0.30
    WEIGHT_EXPERIENCE: float = 0.15
    WEIGHT_TITLE: float = 0.10
    WEIGHT_LOCATION: float = 0.10
    WEIGHT_FRESHNESS: float = 0.05
    
    # NLP & AI Models
    SPACY_MODEL: str = os.getenv("SPACY_MODEL", "en_core_web_sm")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"


settings = Settings()
