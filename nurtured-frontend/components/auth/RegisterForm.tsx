"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard, { authInputCls, authLabelCls } from "@/components/auth/AuthCard";
import { currentNextParam, destinationFor, register } from "@/lib/auth";

const initial = { name: "", email: "", due_date: "", phone: "", password: "", confirm: "" };

/**
 * Customer sign-up.
 *
 * Collects exactly what the checkout flow needs: name, due date (used to hide
 * cohorts that finish after the baby is due), email (the login), phone and a
 * password. The backend signs the new account in, so a customer who arrived from
 * checkout lands straight back on it.
 */
export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setNext(currentNextParam()), 0);
    return () => clearTimeout(t);
  }, []);

  const update =
    (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (values.password !== values.confirm) {
      setError("Those passwords do not match — please check both fields.");
      return;
    }

    setLoading(true);
    const result = await register({
      name: values.name,
      email: values.email,
      due_date: values.due_date,
      phone: values.phone,
      password: values.password,
    });

    if (result.ok && result.session) {
      router.push(destinationFor(result.session, next));
      router.refresh();
      return;
    }

    setError(result.message || "We couldn't create your account. Please try again.");
    setLoading(false);
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Your due date lets us show only the cohorts that finish before your baby is due."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
          >
            Sign in
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
          <label className={authLabelCls} htmlFor="reg-name">
            Full name
          </label>
          <input
            id="reg-name"
            value={values.name}
            onChange={update("name")}
            required
            autoComplete="name"
            className={authInputCls}
          />
        </div>

        <div>
          <label className={authLabelCls} htmlFor="reg-due">
            Estimated due date
          </label>
          <input
            id="reg-due"
            type="date"
            value={values.due_date}
            onChange={update("due_date")}
            required
            className={authInputCls}
          />
        </div>

        <div>
          <label className={authLabelCls} htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            value={values.email}
            onChange={update("email")}
            required
            autoComplete="email"
            className={authInputCls}
          />
          <p className="mt-1 text-xs text-charcoal/55">
            You&apos;ll use this email to sign in.
          </p>
        </div>

        <div>
          <label className={authLabelCls} htmlFor="reg-phone">
            Phone number
          </label>
          <input
            id="reg-phone"
            type="tel"
            value={values.phone}
            onChange={update("phone")}
            autoComplete="tel"
            className={authInputCls}
          />
        </div>

        <div>
          <label className={authLabelCls} htmlFor="reg-password">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            value={values.password}
            onChange={update("password")}
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputCls}
          />
          <p className="mt-1 text-xs text-charcoal/55">At least 8 characters.</p>
        </div>

        <div>
          <label className={authLabelCls} htmlFor="reg-confirm">
            Confirm password
          </label>
          <input
            id="reg-confirm"
            type="password"
            value={values.confirm}
            onChange={update("confirm")}
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputCls}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating your account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
