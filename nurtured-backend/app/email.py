"""Transactional email delivery.

The Resend SDK is imported only when a reset email is actually sent. That keeps
local development and tests bootable with a dummy/missing key while making a
misconfigured production send fail loudly in the logs.
"""
import logging
from html import escape

import resend
from resend.exceptions import ResendError

from .config import RESEND_API_KEY, RESEND_FROM_EMAIL

logger = logging.getLogger("nurture.email")


def send_email_verification_otp(recipient: str, otp: str) -> bool:
    """Send the one-time code used to verify a new customer registration."""
    if not RESEND_API_KEY or RESEND_API_KEY == "re_dummy_replace_me":
        logger.error("Verification email not sent: RESEND_API_KEY is not configured")
        return False

    resend.api_key = RESEND_API_KEY
    safe_otp = escape(otp)
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; color: #3a3a3a;">
      <h1 style="color: #2b9c8e;">Confirm your email address</h1>
      <p>Hello,</p>
      <p>Your verification code for Nurtured &amp; Nourished is:</p>
      <p style="font-size: 30px; font-weight: bold; letter-spacing: 8px; color: #2b9c8e;">{safe_otp}</p>
      <p>This code expires in ten minutes and can only be used once.</p>
      <p>If you did not create this account, you can safely ignore this email.</p>
      <p>— Nurtured &amp; Nourished</p>
    </div>
    """
    try:
        resend.Emails.send({
            "from": RESEND_FROM_EMAIL,
            "to": [recipient],
            "subject": "Your Nurtured & Nourished verification code",
            "html": html,
        })
        return True
    except ResendError:
        logger.exception("Resend rejected the verification email for %s", recipient)
    except Exception:
        logger.exception("Unexpected error sending the verification email for %s", recipient)
    return False


def send_password_reset_email(recipient: str, reset_url: str) -> bool:
    """Send a customer reset link. Return whether Resend accepted it."""
    if not RESEND_API_KEY or RESEND_API_KEY == "re_dummy_replace_me":
        logger.error("Password-reset email not sent: RESEND_API_KEY is not configured")
        return False

    resend.api_key = RESEND_API_KEY
    safe_url = escape(reset_url, quote=True)
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; color: #3a3a3a;">
      <h1 style="color: #2b9c8e;">Reset your Nurtured &amp; Nourished password</h1>
      <p>Hello,</p>
      <p>We received a request to reset your customer account password.</p>
      <p><a href="{safe_url}" style="display:inline-block;padding:12px 20px;background:#2b9c8e;color:#fff;text-decoration:none;border-radius:999px;">Choose a new password</a></p>
      <p>This link expires in one hour and can only be used once.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>— Nurtured &amp; Nourished</p>
    </div>
    """
    try:
        resend.Emails.send({
            "from": RESEND_FROM_EMAIL,
            "to": [recipient],
            "subject": "Reset your Nurtured & Nourished password",
            "html": html,
        })
        return True
    except ResendError:
        logger.exception("Resend rejected the password-reset email for %s", recipient)
    except Exception:
        logger.exception("Unexpected error sending the password-reset email for %s", recipient)
    return False
