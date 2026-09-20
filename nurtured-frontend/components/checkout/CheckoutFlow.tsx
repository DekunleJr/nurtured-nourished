'use client';

/**
 * The purchase flow: sign-in gate → cohort choice → payment plan → Stripe.
 *
 * Every decision that matters (which cohorts exist, which plans are allowed,
 * what each instalment costs) comes from the backend; this component only
 * renders what it is given and posts the selection back.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  CohortsResponse,
  EligibleCohort,
  PlanOption,
  createCheckout,
  fetchEligibleCohorts,
  fetchPackages,
  formatMoney,
} from '@/lib/checkout';
import { fetchSession } from '@/lib/auth';

type Step = 'loading' | 'gate' | 'cohorts' | 'plan' | 'submitting' | 'error';

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** An instalment plan the buyer should be warned about — anything but pay-in-full. */
function isInstalmentPlan(plan: PlanOption): boolean {
  return plan.instalments > 1;
}

const CATEGORY_HINT: Record<string, string> = {
  A: 'Plenty of time — pay in 1, 2 or 3 interest-free instalments.',
  B: 'Getting closer — pay in 1 or 2 interest-free instalments.',
  C: 'Starting soon — this cohort is pay-in-full only.',
};

export default function CheckoutFlow({ packageSlug }: { packageSlug: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [message, setMessage] = useState('');
  const [catalogue, setCatalogue] = useState<CohortsResponse | null>(null);
  const [cohort, setCohort] = useState<EligibleCohort | null>(null);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  /** Resolve slug → package id, then load the signed-in state. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sess, packages] = await Promise.all([
        fetchSession(),
        packageSlug ? fetchPackages() : Promise.resolve([]),
      ]);
      if (cancelled) return;
      const pkg = packages.find((p) => p.slug === packageSlug);
      if (!pkg) {
        setStep('error');
        setMessage('We could not find that programme. Please choose one from the packages page.');
        return;
      }
      if (!sess || sess.role !== 'user') {
        setStep('gate');
        return;
      }
      const result = await fetchEligibleCohorts(pkg.id);
      if (cancelled) return;
      if (!result.ok || !result.data) {
        setStep('error');
        setMessage(result.message ?? 'Could not load cohorts');
        return;
      }
      setCatalogue(result.data);
      setStep('cohorts');
    })();
    return () => {
      cancelled = true;
    };
  }, [packageSlug]);

  const choosePlan = useCallback(
    async (plan: PlanOption) => {
      if (!catalogue || !cohort) return;
      setBusyPlan(plan.code);
      setMessage('');
      const result = await createCheckout(catalogue.package.id, cohort.id, plan.code);
      if (!result.ok || !result.data) {
        setBusyPlan(null);
        setMessage(result.message ?? 'Checkout failed');
        return;
      }
      const url = result.data.checkout_url;
      if (url) {
        // Stripe owns the next screen; it returns the customer to /my?ref=…
        window.location.href = url;
        return;
      }
      // Stripe not configured (or nothing to collect): the place is reserved.
      router.push(`/my?ref=${result.data.reference}`);
    },
    [catalogue, cohort, router],
  );
  if (step === 'loading') {
    return (
      <Shell>
        <Eyebrow>Securing your place</Eyebrow>
        <h1 className="display-2 mt-3 text-center font-serif font-semibold text-charcoal">
          Checking your account…
        </h1>
        <p className="mt-6 text-center text-charcoal/60">One moment please.</p>
      </Shell>
    );
  }

  if (step === 'error') {
    return (
      <Shell>
        <Eyebrow>Something went wrong</Eyebrow>
        <h1 className="display-2 mt-3 text-center font-serif font-semibold text-charcoal">
          We could not continue
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-charcoal/70">{message}</p>
        <div className="mt-8 text-center">
          <Link
            href="/packages"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Back to packages
          </Link>
        </div>
      </Shell>
    );
  }

  if (step === 'gate') {
    const next = `/checkout?package=${encodeURIComponent(packageSlug)}`;
    return (
      <Shell>
        <Eyebrow>Before you book</Eyebrow>
        <h1 className="display-2 mt-3 text-center font-serif font-semibold text-charcoal">
          Sign in to secure your place
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-charcoal/70">
          We check the cohorts you can join against your due date, so we need
          you signed in first.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="rounded-full bg-primary px-6 py-3.5 text-center text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            Sign in
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="rounded-full border border-primary/40 px-6 py-3.5 text-center text-sm font-semibold text-primary-dark transition-colors hover:bg-primary/10"
          >
            Create an account
          </Link>
          <p className="mt-2 text-center text-xs text-charcoal/55">
            Registration takes under a minute — we just need your name, due
            date, email, phone number and a password.
          </p>
        </div>
      </Shell>
    );
  }

  if (step === 'cohorts' && catalogue) {
    return (
      <Shell>
        <Eyebrow>Step 1 of 2</Eyebrow>
        <h1 className="display-2 mt-3 text-center font-serif font-semibold text-charcoal">
          Choose your cohort
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-charcoal/70">
          {catalogue.package.name} cohorts that finish before your due date
          {catalogue.due_date ? ` (${formatDate(catalogue.due_date)})` : ''}.
        </p>
        {message && (
          <p className="mx-auto mt-4 max-w-lg rounded-xl bg-coral/10 p-4 text-center text-sm text-coral-dark">
            {message}
          </p>
        )}
        {catalogue.items.length === 0 ? (
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-charcoal/10 bg-white p-8 text-center">
            <p className="text-charcoal/70">
              No cohort finishes before your due date at the moment. Please
              check back soon — new dates are added regularly.
            </p>
            <Link
              href="/discovery"
              className="mt-6 inline-block rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-primary-dark hover:bg-primary/10"
            >
              Book a free discovery call
            </Link>
          </div>
        ) : (
          <ul className="mx-auto mt-8 grid max-w-2xl gap-4">
            {catalogue.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCohort(item);
                    setMessage('');
                    setStep('plan');
                  }}
                  className="w-full rounded-2xl border border-charcoal/10 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_14px_30px_-18px_rgb(43_156_142/0.45)]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-serif text-lg font-semibold text-charcoal">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-primary-dark">Select</span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal/70">
                    {formatDate(item.start_date)} – {formatDate(item.end_date)}
                    {item.session_time ? ` · ${item.session_time}` : ''}
                  </p>
                  <p className="mt-2 text-xs text-charcoal/55">
                    {CATEGORY_HINT[item.category] ?? ''} {item.seats_left}{' '}
                    {item.seats_left === 1 ? 'place' : 'places'} left.
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Shell>
    );
  }

  if (step === 'plan' && cohort && catalogue) {
    const currency = catalogue.package.currency;
    return (
      <Shell>
        <Eyebrow>Step 2 of 2</Eyebrow>
        <h1 className="display-2 mt-3 text-center font-serif font-semibold text-charcoal">
          Choose how to pay
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-charcoal/70">
          {catalogue.package.name} · {cohort.label} · starts{' '}
          {formatDate(cohort.start_date)}
        </p>
        {message && (
          <p className="mx-auto mt-4 max-w-lg rounded-xl bg-coral/10 p-4 text-center text-sm text-coral-dark">
            {message}
          </p>
        )}
        <ul className="mx-auto mt-8 grid max-w-2xl gap-4">
          {cohort.plans.map((plan) => (
            <li key={plan.code}>
              <button
                type="button"
                disabled={busyPlan !== null}
                onClick={() => choosePlan(plan)}
                className="w-full rounded-2xl border border-charcoal/10 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_14px_30px_-18px_rgb(43_156_142/0.45)] disabled:cursor-wait disabled:opacity-60"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-serif text-lg font-semibold text-charcoal">
                    {plan.label}
                  </span>
                  <span className="text-sm font-semibold text-primary-dark">
                    {busyPlan === plan.code ? 'Reserving your place…' : 'Select'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-charcoal/70">{plan.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {plan.amounts_pence.map((amount, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-charcoal"
                    >
                      Payment {index + 1}: {formatMoney(amount, currency)}
                    </span>
                  ))}
                </div>
                {isInstalmentPlan(plan) && (
                  <p className="mt-3 rounded-xl bg-coral/10 p-3 text-xs leading-5 text-coral-dark">
                    Please note: all instalments must be completed before your
                    cohort starts on {formatDate(cohort.start_date)}.
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setCohort(null);
              setMessage('');
              setStep('cohorts');
            }}
            className="text-sm font-semibold text-charcoal/60 underline underline-offset-4 hover:text-charcoal"
          >
            ← Choose a different cohort
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-center text-charcoal/60">Redirecting to payment…</p>
    </Shell>
  );
}

/** Centre-column page furniture shared by every step of the flow. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-primary-soft/40 py-20">
      <div className="mx-auto max-w-4xl px-4">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-coral">
      {children}
    </p>
  );
}
