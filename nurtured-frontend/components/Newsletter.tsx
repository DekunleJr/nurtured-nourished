"use client";

import { useState, type FormEvent } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    // TODO: Connect to your email marketing service (Mailchimp, ConvertKit, etc.)
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-primary-soft p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-charcoal">Thank you for subscribing!</h3>
        <p className="mt-2 text-sm text-charcoal/60">Watch your inbox for our latest updates and perinatal tips.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-primary-soft p-8">
      <h3 className="text-xl font-bold text-charcoal">Stay informed</h3>
      <p className="mt-2 text-sm text-charcoal/70">
        Get perinatal tips, early access to programmes, and updates straight to your inbox.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:opacity-60"
        >
          {status === "submitting" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-sm text-coral">Something went wrong. Please try again.</p>
      )}
      <p className="mt-3 text-xs text-charcoal/50">We respect your privacy. Unsubscribe at any time.</p>
    </div>
  );
}
