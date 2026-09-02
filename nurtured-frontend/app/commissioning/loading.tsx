export default function CommissioningLoading() {
  return (
    <>
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="h-6 w-32 animate-pulse rounded bg-white/20" />
          <div className="mt-4 h-12 w-96 max-w-full animate-pulse rounded-lg bg-white/20" />
          <div className="mt-4 h-6 w-80 max-w-full animate-pulse rounded bg-white/15" />
          <div className="mt-8 flex gap-2">
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/15" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/15" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/15" />
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="h-6 w-24 animate-pulse rounded bg-mist/40" />
              <div className="mt-4 h-10 w-72 animate-pulse rounded-lg bg-mist/60" />
              <div className="mt-4 h-6 w-full animate-pulse rounded bg-mist/40" />
              <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-mist/40" />
            </div>
            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 rounded-2xl border border-charcoal/10 bg-white p-5">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-mist/40" />
                    {i < 4 && <div className="mt-2 w-px flex-1 animate-pulse bg-mist/30" />}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-16 animate-pulse rounded bg-mist/40" />
                    <div className="mt-2 h-5 w-40 animate-pulse rounded bg-mist/50" />
                    <div className="mt-2 h-4 w-full animate-pulse rounded bg-mist/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
