"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard, { authInputCls, authLabelCls } from "@/components/auth/AuthCard";
import { currentNextParam, destinationFor, login } from "@/lib/auth";

/**
 * The one sign-in form for the whole site.
 *
 * The backend decides whether the credentials belong to an admin or a customer
 * and returns the role; `destinationFor` then sends the person to the page they
 * were interrupted on (`?next=`), or to their role's home.
 */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    // Read ?next= from the URL here rather than with useSearchParams, so the page
    // needs no Suspense boundary and stays cheaply renderable.
    const t = setTimeout(() => setNext(currentNextParam()), 0);
    return () => clearTimeout(t);
  }, []);

  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : "/register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);
    if (result.ok && result.session) {
      // Stay in the loading state while navigating, so the button never
      // flickers back to "Sign in" mid-redirect.
      router.push(destinationFor(result.session, next));
      router.refresh();
      return;
    }

    setError(result.message || "We couldn't sign you in. Please try again.");
    setLoading(false);
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your programme and payments, or the admin dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={registerHref}
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
          >
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-coral/30 bg-peach/30 px-4 py-2.5 text-sm text-charcoal"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={authLabelCls} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={authInputCls}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <label className={authLabelCls} htmlFor="login-password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="mb-1 text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={`${authInputCls} pr-11`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 transition-colors hover:text-charcoal"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
