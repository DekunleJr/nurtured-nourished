import os
import logging
import sys
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

# --- Admin bootstrap (first admin only) ---
# Admin accounts live in the `admins` table and are managed from the dashboard.
# These env vars are used ONLY to seed the very first admin when the table is
# empty. Once you can log in you can remove them — new admins are then created
# via the dashboard's "Manage admins" section.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "").strip().lower()
ADMIN_NAME = os.getenv("ADMIN_NAME", "Administrator")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

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
if ENV.lower() == "production" and ADMIN_EMAIL and ADMIN_PASSWORD in ("", "admin123", "changeme"):
    logger.error(
        "Production startup blocked: admin bootstrap password missing or default. "
        "Set ADMIN_EMAIL and ADMIN_PASSWORD (used only to seed the first admin)."
    )
    sys.exit("FATAL: admin bootstrap credentials not allowed in production.")

# Log admin bootstrap setup
if ADMIN_EMAIL:
    logger.info("Admin bootstrap configured for first admin: '%s'", ADMIN_EMAIL)
else:
    logger.info("No ADMIN_EMAIL set — admin accounts are managed via the dashboard")
