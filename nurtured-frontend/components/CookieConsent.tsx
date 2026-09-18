"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  CONSENT_RESET_EVENT,
  clearConsent,
  readConsent,
  writeConsent,
} from "@/lib/cookieConsent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showIfUnset = () => {
      if (!readConsent()) {
        // Deferred out of the synchronous effect body
        // (react-hooks/set-state-in-effect).
        const id = window.setTimeout(() => setVisible(true), 0);
        return () => window.clearTimeout(id);
      }
    };

    const cleanupShow = showIfUnset();

    const onReset = () => {
      clearConsent();
      setVisible(true);
    };
    window.addEventListener(CONSENT_RESET_EVENT, onReset);

    return () => {
      if (cleanupShow) cleanupShow();
      window.removeEventListener(CONSENT_RESET_EVENT, onReset);
    };
  }, []);

  function accept() {
    writeConsent("accepted");
    setVisible(false);
  }

  function reject() {
    writeConsent("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-charcoal p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <h3 className="font-semibold">We value your privacy</h3>
            <p className="mt-1 text-sm text-white/70">
              We use cookies to enhance your experience. By continuing to visit this site you
              agree to our use of cookies.{" "}
              <Link href="/cookies" className="text-primary-soft underline">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={reject}
              className="min-h-[44px] rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Reject
            </button>
            <button
              onClick={accept}
              className="min-h-[44px] rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
