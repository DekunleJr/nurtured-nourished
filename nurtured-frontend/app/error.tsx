"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="bg-cream">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          Something went wrong
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal md:text-5xl">
          We&apos;re having a problem
        </h1>
        <p className="mt-4 text-lg leading-8 text-charcoal/70">
          Sorry about that — please try again in a moment. If the problem
          persists, email us and we&apos;ll get it sorted.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-coral px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border-2 border-primary px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Back to home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-charcoal/40">Ref: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
