import os
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env even if uvicorn's parent process already exported placeholders.
_ENV_FILE = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(_ENV_FILE, override=True)


class Settings:
    supabase_url: str
    supabase_publishable_key: str
    frontend_origins: list[str]

    def __init__(self) -> None:
        self.supabase_url = os.environ['SUPABASE_URL'].rstrip('/')
        self.supabase_publishable_key = os.environ['SUPABASE_PUBLISHABLE_KEY']
        self.frontend_origins = [
            origin.strip()
            for origin in os.getenv('FRONTEND_ORIGINS', 'http://localhost:3000').split(',')
            if origin.strip()
        ]


settings = Settings()
