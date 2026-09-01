export default function Loading() {
  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="space-y-4">
          <div className="h-8 w-1/3 animate-pulse rounded-lg bg-mist/60" />
          <div className="h-12 w-2/3 animate-pulse rounded-lg bg-mist/60" />
          <div className="h-6 w-full max-w-xl animate-pulse rounded-lg bg-mist/40" />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="h-80 animate-pulse rounded-3xl bg-mist/40" />
          <div className="h-80 animate-pulse rounded-3xl bg-mist/40" />
          <div className="h-80 animate-pulse rounded-3xl bg-mist/40" />
        </div>
      </div>
    </div>
  );
}
