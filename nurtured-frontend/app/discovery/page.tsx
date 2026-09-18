import DiscoveryBooking from "@/components/DiscoveryBooking";
import Eyebrow from "@/components/ui/Eyebrow";

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
          <Eyebrow align="center">Discovery consultation</Eyebrow>
          <h1 className="display-1 mt-4 font-serif font-semibold text-charcoal">
            Book your complimentary 15-minute call
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-charcoal/70">
            A relaxed chat with Favour about your journey, the option that suits you
            and how your birthing partner can be involved from the start.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <DiscoveryBooking presetSlug={presetSlug} />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[2rem] border border-charcoal/10 bg-white p-5 text-center card-lift">
              <p className="font-serif text-2xl text-charcoal">15 min</p>
              <p className="mt-1 text-sm text-charcoal/60">Complimentary, friendly and no obligation</p>
            </div>
            <div className="rounded-[2rem] border border-charcoal/10 bg-white p-5 text-center card-lift">
              <p className="font-serif text-2xl text-charcoal">Online</p>
              <p className="mt-1 text-sm text-charcoal/60">From wherever you are in the UK</p>
            </div>
            <div className="rounded-[2rem] border border-charcoal/10 bg-white p-5 text-center card-lift">
              <p className="font-serif text-2xl text-charcoal">You + partner</p>
              <p className="mt-1 text-sm text-charcoal/60">Your birthing partner is welcome to join</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}