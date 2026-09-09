import os
import logging
import sys
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

# --- Admin Authentication ---
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
# Plain text password (hashed at startup). Prefer ADMIN_PASSWORD_HASH below.
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
# If an ADMIN_PASSWORD_HASH env var is provided, use it directly so the plain
# password never needs to be stored. Otherwise derive a fresh bcrypt hash from
# ADMIN_PASSWORD at startup.
_ENV_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "").strip()
if _ENV_PASSWORD_HASH:
    ADMIN_PASSWORD_HASH = _ENV_PASSWORD_HASH
else:
    ADMIN_PASSWORD_HASH = bcrypt.hashpw(
        ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-to-a-long-random-string-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# The admin session cookie shared by backend + Next.js.
SESSION_COOKIE = "admin-session"

# --- Production safety guards ---
_DEFAULT_SECRET = "change-this-to-a-long-random-string-in-production"
if ENV.lower() == "production" and JWT_SECRET == _DEFAULT_SECRET:
    logger.error(
        "Production startup blocked: JWT_SECRET is still the default value. "
        "Set a strong, unique JWT_SECRET before deploying."
    )
    sys.exit("FATAL: JWT_SECRET must be set in production.")
if ENV.lower() == "production" and (ADMIN_USERNAME == "admin" or ADMIN_PASSWORD in ("admin123", "changeme")):
    logger.error(
        "Production startup blocked: default admin credentials detected. "
        "Set ADMIN_USERNAME and ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) before deploying."
    )
    sys.exit("FATAL: default admin credentials not allowed in production.")

# Log admin setup
if ADMIN_USERNAME and ADMIN_PASSWORD_HASH:
    logger.info("Admin authentication configured for user: '%s'", ADMIN_USERNAME)
    if _ENV_PASSWORD_HASH:
        logger.info("Admin password loaded from ADMIN_PASSWORD_HASH (bcrypt)")
    else:
        logger.info("Admin password hashed successfully (bcrypt)")
