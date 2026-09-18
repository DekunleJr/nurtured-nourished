/**
 * Shared cookie-consent store used by both the consent banner and the
 * cookie-policy page, so they can never disagree.
 *
 * The key is versioned: bumping the suffix re-prompts every visitor whose
 * stored answer was given under an earlier version of this notice.
 */
export const CONSENT_KEY = "nn_cookie_consent_v2";
export const CONSENT_RESET_EVENT = "nn:cookie-consent-reset";

export type ConsentValue = "accepted" | "rejected";

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    // Storage can be blocked (private mode, in-app browsers) — fail open.
    return null;
  }
}

export function writeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Session-only consent if storage is unavailable.
  }
}

export function clearConsent() {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Ignore — the banner can still be re-shown for the session.
  }
}

/** Dispatch from anywhere (e.g. the footer link) to re-open the banner. */
export function requestConsentReset() {
  window.dispatchEvent(new CustomEvent(CONSENT_RESET_EVENT));
}
