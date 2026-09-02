import os
from dotenv import load_dotenv

# Load variables from the backend .env file (DATABASE_URL etc.).
# Use absolute path so it works regardless of current working directory.
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(_backend_dir, ".env"))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/postgres",
)
ENV = os.getenv("ENV", "development")
CORS_ORIGINS = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()
]
