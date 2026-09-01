import DiscoveryBooking from "@/components/DiscoveryBooking";

export const metadata = { title: "Book a Discovery Call" };

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const params = await searchParams;
  const presetSlug = params.package ?? null;

  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Discovery consultation
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            Book your free 15-minute call
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-charcoal/70">
            A relaxed chat with our team about your journey, the right package for
            you and how we can support you and your birthing partner.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <DiscoveryBooking presetSlug={presetSlug} />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-charcoal/10 bg-white p-5 text-center">
              <p className="text-2xl font-extrabold text-primary">15 min</p>
              <p className="mt-1 text-sm text-charcoal/60">Free, friendly and no obligation</p>
            </div>
            <div className="rounded-2xl border border-charcoal/10 bg-white p-5 text-center">
              <p className="text-2xl font-extrabold text-primary">Online</p>
              <p className="mt-1 text-sm text-charcoal/60">From wherever you are in the UK</p>
            </div>
            <div className="rounded-2xl border border-charcoal/10 bg-white p-5 text-center">
              <p className="text-2xl font-extrabold text-primary">You + partner</p>
              <p className="mt-1 text-sm text-charcoal/60">Your birthing partner is welcome to join</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}