import os
import logging
import bcrypt
from dotenv import load_dotenv

logger = logging.getLogger("admin.auth")

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

# Admin credentials - password hashed at runtime with bcrypt
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-to-a-long-random-string-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Hash the admin password at startup
ADMIN_PASSWORD_HASH = bcrypt.hashpw(
    ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()
).decode("utf-8")

# Log admin setup
if ADMIN_USERNAME and ADMIN_PASSWORD_HASH:
    logger.info("Admin authentication configured for user: '%s'", ADMIN_USERNAME)
    logger.info("Admin password hashed successfully (bcrypt)")
