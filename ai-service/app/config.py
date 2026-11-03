from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "NexHire AI Service"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # spaCy model
    SPACY_MODEL: str = "en_core_web_sm"

    # Sentence Transformer model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Matching weights (configurable)
    WEIGHT_SEMANTIC: float = 0.30
    WEIGHT_SKILLS: float = 0.30
    WEIGHT_EXPERIENCE: float = 0.15
    WEIGHT_TITLE: float = 0.10
    WEIGHT_LOCATION: float = 0.10
    WEIGHT_FRESHNESS: float = 0.05

    # File limits
    MAX_FILE_SIZE_MB: int = 10

    # Backend API URL
    BACKEND_URL: str = "http://localhost:5000"

    class Config:
        env_file = ".env"


settings = Settings()
