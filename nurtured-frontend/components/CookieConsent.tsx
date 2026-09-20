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
  // Defer rendering until the component is mounted on the client, so the
  // banner is never painted during SSR and then hidden on hydration.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Both state updates live inside the frame callback so no setState runs
    // synchronously within the effect body (react-hooks/set-state-in-effect):
    // the banner must never paint during SSR, and a synchronous set would
    // re-render before hydration finishes.
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      if (!readConsent()) {
        setVisible(true);
      }
    });

    const onReset = () => {
      clearConsent();
      setVisible(true);
    };
    window.addEventListener(CONSENT_RESET_EVENT, onReset);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(CONSENT_RESET_EVENT, onReset);
    };
  }, []);

  if (!mounted || !visible) return null;

  function handleReject() {
    writeConsent("rejected");
    setVisible(false);
  }

  function handleAccept() {
    writeConsent("accepted");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-charcoal p-5 shadow-2xl sm:p-6">
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
              type="button"
              onClick={handleReject}
              className="min-h-[44px] rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:px-6 sm:py-2.5"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="min-h-[44px] rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark sm:px-6 sm:py-2.5"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
