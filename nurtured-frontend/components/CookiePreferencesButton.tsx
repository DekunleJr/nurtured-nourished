"use client";

import { requestConsentReset } from "@/lib/cookieConsent";

/** Footer link that clears stored consent and re-opens the cookie banner. */
export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={requestConsentReset}
      className="transition-colors hover:text-white"
    >
      Cookie preferences
    </button>
  );
}