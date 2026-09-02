export default function DiscoveryLoading() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <div className="mx-auto h-8 w-48 animate-pulse rounded-lg bg-mist/60" />
          <div className="mx-auto mt-4 h-12 w-96 max-w-full animate-pulse rounded-lg bg-mist/60" />
          <div className="mx-auto mt-4 h-6 w-80 max-w-full animate-pulse rounded-lg bg-mist/40" />
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-mist/60" />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-mist/40" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-mist/40" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-mist/40" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-mist/40" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-mist/40" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-mist/40" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-mist/40" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-mist/40" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="h-5 w-32 animate-pulse rounded bg-mist/40" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-mist/40" />
              </div>
            </div>
            <div className="mt-8 h-14 w-48 animate-pulse rounded-full bg-mist/40" />
          </div>
        </div>
      </section>
    </>
  );
}
