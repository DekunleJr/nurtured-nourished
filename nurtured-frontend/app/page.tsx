import Link from "next/link";
import Image from "next/image";
import Frame from "@/components/ui/Frame";
import CheckDot from "@/components/ui/CheckDot";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/Reveal";
import { describeFeatures, fetchDynamicPackages, formatPrice, type DynamicPackage } from "@/lib/packages";
import { siteConfig } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

/** Card shape for the homepage "Three ways to be supported" grid. */
type Tier = {
  slug: string;
  name: string;
  tagline: string;
  price: string | null;
  priceNote: string;
  blurb: string;
  features: { text: string; emphasis?: boolean }[];
  cta: string;
};

/** Map a live catalogue row into the homepage card shape. */
function toTier(pkg: DynamicPackage): Tier {
  return {
    slug: pkg.slug,
    name: pkg.name,
    tagline: pkg.tagline,
    price: formatPrice(pkg.price_pence, pkg.currency),
    priceNote: pkg.price_note,
    blurb: pkg.blurb,
    features: describeFeatures(pkg.features),
    cta: pkg.cta_label,
  };
}

const showCicLink =
  /^https:\/\//.test(siteConfig.cicUrl) && !siteConfig.cicUrl.includes("example.org");

/** Credibility line shown directly beneath the hero. */
const credibility = [
  "Live & interactive",
  "Partner-inclusive",
  "Premium resources delivered to you",
  "UK-wide online",
];

/** What the woman arriving on this page is actually looking for. */
const needs = [
  {
    title: "Understand your choices",
    text: "Clear, evidence-informed explanations of the decisions ahead — so you know what is being offered, why it matters and what feels right for you.",
  },
  {
    title: "Prepare properly for birth",
    text: "Structured preparation for birth and the first weeks of parenthood that goes far beyond the basics, so you arrive feeling genuinely ready.",
  },
  {
    title: "Involve your partner",
    text: "Partners are included by design — informed, confident and part of your support team, rather than watching from the side.",
  },
  {
    title: "Feel confident, not overwhelmed",
    text: "One trusted programme instead of a hundred conflicting opinions: calm, consistent guidance you can rely on.",
  },
];

/** The six pillars that make FOBCP a structured live experience. */
const pillars = [
  {
    title: "Live education",
    text: "Interactive teaching delivered live in a small cohort, with space for your questions.",
  },
  {
    title: "Birth preparation",
    text: "Practical preparation for labour, birth, the decisions involved and the unexpected.",
  },
  {
    title: "Partner involvement",
    text: "A dedicated partner session and partner-inclusive delivery, so your birth partner knows how to support you.",
  },
  {
    title: "Infant-feeding preparation",
    text: "Preparation that covers your feeding options with practical, judgement-free guidance.",
  },
  {
    title: "Early-postnatal support",
    text: "One-to-one sessions from birth through the early weeks and months.",
  },
  {
    title: "High-quality learning resources",
    text: "A premium set of resources you keep, study and return to long after the programme ends.",
  },
];

/** Physical materials delivered to online participants before delivery begins. */
const welcomePack = [
  "Premium Workbook",
  "Birth Confidence Journal",
  "Course Handbook",
  "Partner Guide",
  "Essential Resource Pack & Card",
  "Assessment & Evaluation Pack",
];

/** Women's-health vision — clearly separated into live and future services. */
const availableNow = [
  "Perinatal education",
  "Birth preparation",
  "Infant-feeding support",
];

const futureVision = [
  "Reproductive health",
  "Midlife & menopause",
  "Further women's-health services",
];

export default async function Home() {
  // Prices and tier details always come from the live catalogue — the homepage
  // never shows a hardcoded price. When the API is unreachable the grid hides
  // its price lines and an empty state directs visitors to a discovery call.
  const dynamicPackages = await fetchDynamicPackages();
  const tiers: Tier[] = (dynamicPackages ?? []).map(toTier);
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden bg-cream">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary-soft/60 to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Reveal>
                <p className="font-serif text-lg italic text-primary md:text-xl">
                  {siteConfig.tagline}.
                </p>
                <div
                  className="mt-6 h-px w-24 bg-gradient-to-r from-coral via-peach to-transparent"
                  aria-hidden="true"
                />
                <h1 className="display-1 mt-6 font-serif font-semibold text-charcoal">
                  Prepare for birth. Understand your choices. Enter parenthood
                  with confidence.
                </h1>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-6 max-w-xl text-base leading-8 text-charcoal/70 md:text-lg">
                  Premium, evidence-informed perinatal education, birth
                  preparation and infant-feeding support—delivered live online
                  with professional expertise, personal attention and meaningful
                  partner involvement.
                </p>
              </Reveal>
              <Reveal delay={150}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="#programme"
                    className="inline-flex items-center justify-center rounded-full bg-coral px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_-24px_rgb(58_58_58/0.28)] transition-all hover:-translate-y-0.5 hover:bg-primary"
                  >
                    Explore our perinatal programme
                  </Link>
                  <Link
                    href="/discovery"
                    className="inline-flex items-center justify-center rounded-full border border-primary/40 px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
                  >
                    Book a complimentary discovery call
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={220}>
                <ul className="mt-11 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-charcoal/10 pt-6 text-sm font-medium text-charcoal/60">
                  {credibility.map((point) => (
                    <li key={point} className="flex items-center gap-2.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={120} className="reveal-scale relative">
              <div
                className="absolute -right-10 -top-12 hidden h-44 w-44 rounded-full bg-coral/15 blur-3xl lg:block"
                aria-hidden="true"
              />
              <Frame
                src="/a63e2e7966306cca8c1d575d6ebc8552.jpg"
                alt="A confident pregnant woman smiling warmly"
                width={1200}
                height={1500}
                priority
                caption="Small live cohorts · partners fully included"
                imgClassName="img-arch"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* What she is looking for */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              What you are looking for
            </p>
            <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
              You deserve to feel ready — not overwhelmed.
            </h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">
              You are not short of information. You are looking for the right
              information, delivered properly, by someone you trust — and a
              partner who feels genuinely involved.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {needs.map((need, index) => (
              <Reveal key={need.title} delay={index * 70}>
                <div className="border-t border-charcoal/10 pt-6">
                  <h3 className="font-serif text-xl font-semibold text-charcoal">
                    {need.title}
                  </h3>
                  <p className="mt-3 max-w-md text-base leading-7 text-charcoal/65">
                    {need.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOBCP programme */}
      <section id="programme" className="scroll-mt-28 bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-soft">
              The Favour Oloye Birth Confidence Programme™
            </p>
            <h2 className="display-2 mt-4 font-serif font-semibold">
              FOBCP — the programme we are known for
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/75">
              FOBCP™ is a structured six-week live perinatal programme. Live education, birth preparation, partner
              involvement, infant-feeding preparation and early-postnatal support
              are brought together in one considered journey — supported by
              high-quality learning resources you keep.
            </p>
            <p className="mt-4 text-base leading-7 text-white/55">
              This is not a webinar series and it is not a library of videos. It is
              live teaching, in a small cohort, with a defined structure — and a
              professional who knows your name.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 60}>
                <div className="border-t border-white/15 pt-6">
                  <p
                    className="font-serif text-sm italic text-peach"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-serif text-lg font-semibold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    {pillar.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="mt-14 flex flex-col gap-6 border-t border-white/15 pt-8 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-xl text-sm leading-6 text-white/55">
                The full six-week structure, inclusions and fees are published on the
                programme page. Cohort dates are announced as each cohort opens.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-peach"
                >
                  View programme options
                </Link>
                <Link
                  href="/discovery"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Book a complimentary discovery call
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Premium Welcome Pack */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Included with your programme
              </p>
              <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
                The Premium Welcome Pack
              </h2>
              <p className="mt-5 text-lg leading-8 text-charcoal/70">
                Before your first live session, a premium welcome pack arrives at
                your door. It is yours to keep — to write in, return to and rely on
                long after the programme has ended.
              </p>
              <p className="mt-4 text-base leading-7 text-charcoal/60">
                You are investing in a complete learning experience, not simply
                attending a series of sessions online.
              </p>
              <ul className="mt-9 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
                {welcomePack.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-medium text-charcoal/80"
                  >
                    <CheckDot size="sm" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/*
              Photography frame — swap in professional Welcome Pack photography
              when the shoot is complete (same Frame signature treatment).
            */}
            <Reveal delay={120} className="reveal-scale">
              <Frame
                src="/e4361b7cf8fa0a539a06df7b9a5503a1.jpg"
                alt="Premium Welcome Pack and programme resources prepared for delivery"
                width={1200}
                height={900}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Client words — editorial quotation treatment (existing testimonials only) */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <Eyebrow>In their words</Eyebrow>
              <span
                className="quote-mark mt-6 block select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="font-serif text-2xl font-medium leading-relaxed text-charcoal md:text-3xl">
                {testimonials[3].quote}
              </blockquote>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-charcoal/60">
                {testimonials[3].name} · {testimonials[3].location} ·{" "}
                {testimonials[3].package}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {[testimonials[0], testimonials[2], testimonials[4], testimonials[1]].map(
                  (t) => (
                    <figure key={t.name} className="border-t border-charcoal/10 pt-5">
                      <blockquote className="font-serif text-base italic leading-relaxed text-charcoal/75">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>
                      <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/55">
                        {t.name} · {t.location} · {t.package}
                      </figcaption>
                    </figure>
                  ),
                )}
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <p className="mt-14 text-center">
              <Link
                href="/testimonials"
                className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
              >
                Read more client words →
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            {/* Portrait frame — swap in the final professional photograph here */}
            <Reveal className="reveal-scale relative mx-auto w-full max-w-sm lg:mx-0">
              <Frame
                src="/Favour_Oloye.png"
                alt="Favour Oloye, Registered Nurse, Antenatal Educator and Founder of Nurtured & Nourished"
                width={800}
                height={1000}
              />
            </Reveal>

            <Reveal delay={120}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Professional expertise. Personal support.
              </p>
              <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
                Meet Favour Oloye
              </h2>
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-coral">
                Registered Nurse · Antenatal Educator · Founder of Nurtured &amp; Nourished
              </p>
              <p className="mt-7 text-lg leading-8 text-charcoal/70">
                Nurtured &amp; Nourished is founder-led, and at launch every
                programme is delivered personally by Favour. You will not be passed
                to a rotating team or left with a portal of pre-recorded videos —
                the professional who teaches your cohort is the professional who
                answers your questions.
              </p>
              <p className="mt-4 text-base leading-7 text-charcoal/65">
                Favour brings her nursing background, antenatal education
                experience and her own lived understanding of navigating maternity
                care in the UK to every session. Her approach is warm, unhurried
                and built around the woman in front of her — never a script.
              </p>
              {/* Lactation training/qualification wording to be added once confirmed. */}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Programme options */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Programme options
            </p>
            <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
              Three ways to be supported
            </h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">
              Every option is built on the same FOBCP teaching and the same premium
              resources. What changes is the level of individual attention, and how
              long your postnatal support continues after your baby arrives.
            </p>
          </Reveal>

          <div className="mt-14 grid items-stretch gap-8 md:grid-cols-3">
            {tiers.map((tier, index) => (
              <Reveal key={tier.slug} delay={index * 80} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-[1.75rem] border p-8 transition-all duration-300 hover:-translate-y-1 md:p-9 ${
                    tier.slug === "continuity"
                      ? "border-primary/30 bg-gradient-to-b from-primary-soft/60 to-white card-lift"
                      : "border-charcoal/10 bg-white shadow-[0_18px_45px_-24px_rgb(58_58_58/0.28)]"
                  }`}
                >
                  <h3 className="font-serif text-2xl font-semibold text-charcoal">
                    {tier.name}
                  </h3>
                  <p className="mt-2 font-serif text-base italic text-primary">
                    {tier.tagline}
                  </p>
                  {tier.price && (
                    <p className="mt-5 font-serif text-4xl font-semibold text-charcoal">
                      {tier.price}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-6 text-charcoal/65">
                    {tier.blurb}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3 text-sm leading-6 text-charcoal/75">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <CheckDot size="sm" />
                        <span className={feature.emphasis ? "font-semibold text-charcoal" : ""}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <Link
                      href={`/packages#${tier.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_14px_30px_-16px_rgb(32_122_113/0.55)]"
                    >
                      {tier.cta}
                    </Link>
                    <p className="mt-3 text-center text-xs italic leading-5 text-charcoal/55">
                      {tier.priceNote}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {tiers.length === 0 && (
            <div className="mt-10 rounded-[1.75rem] border border-charcoal/10 bg-white p-8 text-center">
              <p className="text-charcoal/70">
                Programme details are being refreshed right now — in the
                meantime, book a complimentary discovery call.
              </p>
              <Link
                href="/discovery"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Book a free discovery call
              </Link>
            </div>
          )}

          <Reveal delay={100}>
            <div className="mx-auto mt-12 max-w-3xl space-y-3 text-center text-sm leading-6 text-charcoal/60">
              <p>
                Every Maternal option is the same complete six-week FOBCP™ — what
                changes is the private postnatal support that follows. Fees and
                interest-free payment options are published in full on the programme
                page.
              </p>
              <p>
                WhatsApp Programme Support is available during the six-week programme,
                Monday&nbsp;–&nbsp;Friday, 9am–5pm, with responses within one working
                day. It is not intended for urgent or emergency medical concerns.
              </p>
              <p>
                Birth partners and chosen supporters are welcome throughout the
                programme, and having one is never a condition of taking part.
              </p>
              <p className="pt-2">
                <Link
                  href="/packages"
                  className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
                >
                  See the full programme detail →
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Frame
                src="/4df1651bdc6530a4ccc9305c9365abc3.jpg"
                alt="Women supporting one another at different stages of life"
                width={1200}
                height={885}
              />
            </Reveal>

            <Reveal delay={120}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-soft">
                Our longer-term vision
              </p>
              <h2 className="display-2 mt-4 font-serif font-semibold">
                Our vision for women&apos;s health.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/75">
                {siteConfig.shortName} exists to support women through every stage
                of life. That ambition is deliberately larger than what we offer
                today — and we will only ever describe as available what is
                genuinely available.
              </p>

              {/* Life-course journey — available stages solid, future stages muted. */}
              <ol className="relative mt-14 lg:grid lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-8">
                <div
                  className="absolute left-[7px] top-3 bottom-3 w-px bg-white/20 lg:left-0 lg:right-0 lg:top-[7px] lg:h-px lg:w-auto lg:bottom-auto"
                  aria-hidden="true"
                />

                {/* Available now */}
                <li className="relative pl-10 lg:pl-0 lg:pt-10">
                  <span
                    className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full bg-peach ring-4 ring-charcoal lg:top-0"
                    aria-hidden="true"
                  />
                  <span className="inline-flex rounded-full bg-white px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-charcoal">
                    Available now
                  </span>
                  <ul className="mt-5 grid gap-3">
                    {availableNow.map((service) => (
                      <li
                        key={service}
                        className="flex items-start gap-3 text-sm font-medium text-white/85"
                      >
                        <CheckDot size="sm" />
                        <span className="pt-0.5">{service}</span>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* Future vision */}
                {futureVision.map((service) => (
                  <li
                    key={service}
                    className="relative mt-10 pl-10 lg:mt-0 lg:pl-0 lg:pt-10"
                  >
                    <span
                      className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border border-white/40 bg-transparent lg:top-0"
                      aria-hidden="true"
                    />
                    <span className="inline-flex rounded-full border border-white/30 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/70">
                      Future vision
                    </span>
                    <p className="mt-5 text-sm font-medium leading-6 text-white/45">
                      {service}
                    </p>
                  </li>
                ))}
              </ol>

              <p className="mt-10 max-w-lg text-sm leading-6 text-white/50">
                These areas form part of our future vision. They are not available
                to book today and will be announced as they launch.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Two pathways — parents and organisations */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-cream card-lift">
                <div className="relative h-60 overflow-hidden sm:h-72">
                  <Image
                    src="/9b4a4f049e6ddd14639d3e0b3f5008bb.jpg"
                    alt="A midwife supporting a mother feeding her baby at home"
                    width={1200}
                    height={800}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8 md:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    For parents
                  </p>
                  <h2 className="display-3 mt-3 font-serif font-semibold text-charcoal">
                    Explore our perinatal programme.
                  </h2>
                  <p className="mt-4 text-base leading-7 text-charcoal/70">
                    One complete six-week FOBCP™ experience — with three levels of
                    private postnatal support to choose from after your baby
                    arrives.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/packages"
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      Explore the programme
                    </Link>
                    <Link
                      href="/discovery"
                      className="inline-flex items-center justify-center rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
                    >
                      Book a discovery call
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={100} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-charcoal card-lift">
                <div className="relative h-60 overflow-hidden sm:h-72">
                  <Image
                    src="/8ef10e1388b82a383ed9da53b48bc922.jpg"
                    alt="A family receiving postnatal support at home with their newborn"
                    width={1200}
                    height={800}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8 md:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-soft">
                    For organisations and commissioners
                  </p>
                  <h2 className="display-3 mt-3 font-serif font-semibold text-white">
                    Commissioning perinatal education and family-focused support
                  </h2>
                  <p className="mt-4 text-base leading-7 text-white/70">
                    Commission evidence-informed perinatal education and
                    family-focused support designed to help parents feel informed,
                    prepared and supported.
                  </p>
                  <div className="mt-auto pt-7">
                    <Link
                      href="/commissioning"
                      className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-peach"
                    >
                      Explore commissioning
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Purpose beyond our programmes */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Social impact
            </p>
            <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
              Purpose beyond our programmes.
            </h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">
              {siteConfig.shortName} works alongside the {siteConfig.cicName} — a
              separate, independently operated community interest company focused on
              widening access to perinatal education and support. Our relationship
              with that organisation is transparent, and it is not presented as
              something it is not.
            </p>
            <p className="mt-4 text-base leading-7 text-charcoal/60">
              Our social-impact commitments are delivered through that separate
              organisation, and we describe our contribution only in terms we can
              genuinely evidence.
            </p>
            <p className="mt-8">
              {showCicLink ? (
                <a
                  href={siteConfig.cicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-base font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
                >
                  Discover our social impact.
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="8 7 17 7 17 16" />
                  </svg>
                </a>
              ) : (
                <Link
                  href="/about"
                  className="text-base font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
                >
                  Discover our social impact.
                </Link>
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Final invitation */}
      <section className="bg-primary-soft">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 md:py-32">
          <Reveal>
            <div
              className="mx-auto h-px w-20 bg-gradient-to-r from-coral via-peach to-coral"
              aria-hidden="true"
            />
            <h2 className="display-1 mt-8 font-serif font-semibold text-charcoal">
              Feel informed. Feel prepared. Feel supported.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-charcoal/70">
              Begin with a complimentary 15-minute discovery call — a relaxed
              conversation about where you are in your journey, and the level of
              support that would genuinely suit you and your birth partner.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/discovery"
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-coral px-9 py-4 text-base font-semibold text-white shadow-[0_18px_45px_-20px_rgb(240_130_129/0.7)] transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_18px_45px_-18px_rgb(43_156_142/0.6)]"
              >
                Book your complimentary discovery call.
              </Link>
              <p className="text-sm text-charcoal/55">
                No obligation and no pressure — you will speak with Favour
                directly.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
