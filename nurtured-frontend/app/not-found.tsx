import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-cream">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          404
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal md:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-lg leading-8 text-charcoal/70">
          Sorry — we couldn&apos;t find what you were looking for. It may have
          moved or no longer exists.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-coral px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary"
          >
            Back to home
          </Link>
          <Link
            href="/packages"
            className="rounded-full border-2 border-primary px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            View packages
          </Link>
        </div>
      </div>
    </section>
  );
}
