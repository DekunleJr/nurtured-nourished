"""Shared per-IP login throttle.

Both the admin login and the unified customer login authenticate against the
same cookie and the same tables, so they must share one lockout state —
otherwise an attacker could alternate between endpoints to get double the
attempts against the same account.

Model: N failed attempts in a sliding window block further attempts from that
IP. State is in-process, which is correct for a single uvicorn worker; a
multi-instance deployment should move this to Redis.
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, List

from fastapi import Request

_LOGIN_FAILURES: Dict[str, List[datetime]] = {}
LOGIN_LOCK_SECONDS = 15 * 60
LOGIN_MAX_FAILURES = 5


def client_ip(request: Request) -> str:
    """Best-effort client IP, honouring the proxy's X-Forwarded-For header."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _recent_failures(ip: str) -> List[datetime]:
    now = datetime.now(timezone.utc)
    attempts = [
        t for t in _LOGIN_FAILURES.get(ip, []) if t > now - timedelta(seconds=LOGIN_LOCK_SECONDS)
    ]
    _LOGIN_FAILURES[ip] = attempts
    return attempts


def record_login_failure(ip: str) -> None:
    """Record one failed attempt for this IP."""
    attempts = _recent_failures(ip)
    attempts.append(datetime.now(timezone.utc))
    _LOGIN_FAILURES[ip] = attempts


def login_locked(ip: str) -> bool:
    """True when this IP has used up its failed attempts."""
    return len(_recent_failures(ip)) >= LOGIN_MAX_FAILURES


def clear_login_failures(ip: str) -> None:
    """Reset the counter after a successful login."""
    _LOGIN_FAILURES.pop(ip, None)
