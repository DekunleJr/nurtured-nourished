"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Deferred out of the synchronous effect body
      // (react-hooks/set-state-in-effect).
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function reject() {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-4xl rounded-2xl bg-charcoal p-6 shadow-2xl">
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
              className="rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Reject
            </button>
            <button
              onClick={accept}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
