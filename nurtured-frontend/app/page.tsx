import Image from "next/image";
import Link from "next/link";
import { packages } from "@/lib/packages";
import { siteConfig } from "@/lib/site";

const values = [
  { title: "Compassion", text: "We listen, understand and care." },
  { title: "Empowerment", text: "We help you feel confident in your own decisions." },
  { title: "Excellence", text: "Committed to quality, professionalism and continuous improvement." },
  { title: "Integrity", text: "We communicate honestly and act responsibly." },
  { title: "Continuity", text: "Women's health is a lifelong journey, not a single moment." },
];

const offerings = [
  { title: "Group programmes", text: "Six-week live online group programmes for small, supportive cohorts." },
  { title: "Partner sessions", text: "Dedicated sessions so birthing partners know how to support you." },
  { title: "Postnatal support", text: "One-to-one sessions from birth through the early weeks and months." },
  { title: "Infant feeding support", text: "Practical, judgement-free guidance for your feeding journey." },
  { title: "One-to-one coaching", text: "Individualised birth preparation, tailored entirely to you." },
  { title: "Ongoing community", text: "Email updates and active WhatsApp support throughout the programme." },
];

const journey = ["Menarche", "Reproductive years", "Motherhood", "Midlife", "Menopause"];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Perinatal education & maternity support
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-charcoal md:text-5xl">
              Confident parents, from bump to beyond.
            </h1>
            <p className="text-lg leading-8 text-charcoal/70">
              {siteConfig.shortName} provides expert perinatal
              education through online group programmes, birth preparation
              coaching and postnatal support — available across the UK whenever
              you need us.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/discovery"
                className="rounded-full bg-coral px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary"
              >
                Book a free discovery call
              </Link>
              <Link
                href="/packages"
                className="rounded-full border-2 border-primary px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                View maternity packages
              </Link>
            </div>
            <p className="text-sm text-charcoal/55">
              Birthing partners are welcome throughout every programme.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-peach/50 blur-2xl" aria-hidden="true" />
            <Image
              src="/a63e2e7966306cca8c1d575d6ebc8552.jpg"
              alt="A confident pregnant woman smiling warmly"
              width={1200}
              height={1500}
              priority
              className="relative w-full rounded-3xl object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-serif text-3xl font-semibold md:text-4xl">
            Our brand values
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                <h3 className="text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Image
              src="/4df1651bdc6530a4ccc9305c9365abc3.jpg"
              alt="A group of mothers sharing a relaxed moment together"
              width={1200}
              height={885}
              className="w-full rounded-3xl object-cover shadow-lg"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                What we offer
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
                Education, support and preparation — at every step
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {offerings.map((o) => (
                  <div key={o.title} className="rounded-2xl border border-charcoal/10 bg-white p-5">
                    <h3 className="font-bold text-charcoal">{o.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-charcoal/65">{o.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages preview */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Our packages
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              Choose the support that fits your journey
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {packages.map((p) => (
              <div
                key={p.slug}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  p.flagship
                    ? "overflow-hidden border-2 border-coral bg-primary-soft shadow-lg"
                    : "border border-charcoal/10 bg-cream"
                }`}
              >
                {p.flagship && (
                  <span className="absolute inset-x-0 top-0 bg-coral py-1.5 text-center text-xs font-bold uppercase tracking-widest text-white">
                    Flagship Programme
                  </span>
                )}
                <h3 className={`mt-3 text-xl font-bold ${p.flagship ? "text-primary" : "text-charcoal"}`}>
                  {p.name}
                </h3>
                <p className="mt-2 text-4xl font-extrabold text-charcoal">{p.price}</p>
                <p className="mt-3 text-sm leading-6 text-charcoal/65">{p.blurb}</p>
                <Link
                  href={`/discovery?package=${p.slug}`}
                  className={`mt-6 rounded-full px-5 py-3 text-center text-sm font-semibold ${
                    p.flagship
                      ? "bg-coral text-white hover:bg-primary"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-charcoal/60">
            Birthing partners are welcome throughout all programme deliveries and
            are highly encouraged to attend the dedicated partner sessions.
          </p>
          <div className="mt-8 text-center">
            <Link href="/packages" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark">
              Compare all three packages in full →
            </Link>
          </div>
        </div>
      </section>

      {/* Women's journey */}
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-serif text-3xl font-semibold md:text-4xl">
            One brand. Every stage. One continuous journey.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-white/70">
            From menarche to menopause, we’re here with education and support woven
            through every stage of a woman’s life.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {journey.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="rounded-full border border-primary-soft/40 px-5 py-2.5 text-sm font-semibold text-primary-soft">
                  {stage}
                </span>
                {i < journey.length - 1 && (
                  <span className="text-coral" aria-hidden="true">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual audience */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-primary p-10 text-white">
              <h3 className="text-2xl font-bold">For parents</h3>
              <p className="mt-3 leading-7 text-white/85">
                Bring calm and confidence to your pregnancy and the early weeks of
                parenthood with our live online programmes and one-to-one coaching.
              </p>
              <Link
                href="/packages"
                className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-peach"
              >
                Explore packages
              </Link>
            </div>
            <div className="rounded-3xl bg-coral p-10 text-white">
              <h3 className="text-2xl font-bold">For NHS & employers</h3>
              <p className="mt-3 leading-7 text-white/90">
                Commission expert perinatal education and family-friendly
                support that measurably improves outcomes for staff and communities.
              </p>
              <Link
                href="/commissioning"
                className="mt-6 inline-block rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white hover:bg-primary"
              >
                Commissioning & B2B
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-primary-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Your journey starts with a free 15-minute chat
          </h2>
          <p className="max-w-xl text-lg leading-8 text-charcoal/70">
            Tell us where you are in your journey and we’ll recommend the right
            support for you and your birthing partner.
          </p>
          <Link
            href="/discovery"
            className="rounded-full bg-coral px-8 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary"
          >
            Book your discovery call
          </Link>
        </div>
      </section>
    </>
  );
}
