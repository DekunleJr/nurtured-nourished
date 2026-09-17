import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { packages } from "@/lib/packages";
import { siteConfig } from "@/lib/site";

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

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Reveal>
                <p className="font-serif text-base italic text-primary sm:text-lg">
                  {siteConfig.tagline}.
                </p>
                <h1 className="mt-5 font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight text-charcoal sm:text-4xl md:text-5xl lg:text-[3.35rem]">
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
                    className="inline-flex items-center justify-center rounded-full bg-coral px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary"
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
                <ul className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-charcoal/10 pt-6 text-sm font-medium text-charcoal/60">
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

            <Reveal delay={120} className="relative">
              <div
                className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-peach/40 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-8 right-2 h-40 w-40 rounded-full bg-primary-soft/70 blur-3xl"
                aria-hidden="true"
              />
              <Image
                src="/a63e2e7966306cca8c1d575d6ebc8552.jpg"
                alt="A confident pregnant woman smiling warmly"
                width={1200}
                height={1500}
                priority
                className="relative w-full rounded-[2rem] object-cover shadow-2xl"
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
            <h2 className="mt-4 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
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
            <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
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
                  <h3 className="font-serif text-lg font-semibold text-white">
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
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Included with your programme
              </p>
              <h2 className="mt-4 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
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
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/*
              Photography frame — reserved for professional Welcome Pack images.
              Replace the decorative composition below with an <Image /> of the
              pack and its resources once the shoot is complete.
            */}
            <Reveal delay={120}>
              <div className="rounded-[2rem] border border-charcoal/10 bg-white p-5 shadow-xl sm:p-7">
                <div className="relative flex min-h-[21rem] items-center justify-center overflow-hidden rounded-[1.5rem] bg-primary-soft/50 px-6 py-16 sm:min-h-[26rem]">
                  <div
                    className="absolute left-[8%] top-[12%] h-52 w-36 -rotate-[9deg] rounded-xl bg-white/70 shadow-sm"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-[10%] top-[18%] h-48 w-32 rotate-[8deg] rounded-xl bg-white/60 shadow-sm"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute bottom-[9%] left-1/2 h-40 w-56 -translate-x-1/2 rotate-[2deg] rounded-xl bg-white/50 shadow-sm"
                    aria-hidden="true"
                  />
                  <div className="relative max-w-[17rem] rounded-2xl bg-white/95 px-8 py-10 text-center shadow-lg">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-primary">
                      Nurtured &amp; Nourished
                    </p>
                    <p className="mt-4 font-serif text-2xl font-semibold leading-tight text-charcoal">
                      Premium Welcome Pack
                    </p>
                    <p className="mt-3 text-sm leading-6 text-charcoal/60">
                      Printed resources prepared in advance and delivered to you
                      before your programme begins.
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-center text-[0.65rem] font-medium uppercase tracking-[0.22em] text-charcoal/40">
                  Professional pack photography coming soon
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            {/* Portrait frame — swap in the final professional photograph here */}
            <Reveal className="mx-auto w-full max-w-sm lg:mx-0">
              <div className="rounded-[2rem] border border-charcoal/10 bg-cream p-4 shadow-xl">
                <div className="overflow-hidden rounded-[1.5rem]">
                  <Image
                    src="/Favour_Oloye.png"
                    alt="Favour Oloye, Registered Nurse, Antenatal Educator and Founder of Nurtured & Nourished"
                    width={800}
                    height={1000}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Professional expertise. Personal support.
              </p>
              <h2 className="mt-4 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
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
            <h2 className="mt-4 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              Three ways to be supported
            </h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">
              Every option is built on the same FOBCP teaching and the same premium
              resources. What changes is the level of individual attention, and how
              long your postnatal support continues after your baby arrives.
            </p>
          </Reveal>

          <div className="mt-14 grid items-stretch gap-8 md:grid-cols-3">
            {packages.map((tier, index) => (
              <Reveal key={tier.slug} delay={index * 80} className="h-full">
                <div className="flex h-full flex-col rounded-[1.75rem] border border-charcoal/10 bg-white p-8 md:p-9">
                  <h3 className="font-serif text-2xl font-semibold text-charcoal">
                    {tier.name}
                  </h3>
                  <p className="mt-2 font-serif text-base italic text-primary">
                    {tier.tagline}
                  </p>
                  <p className="mt-5 text-3xl font-bold text-primary">{tier.price}</p>
                  <p className="mt-3 text-sm leading-6 text-charcoal/65">
                    {tier.blurb}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3 text-sm leading-6 text-charcoal/75">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        <span className={feature.emphasis ? "font-semibold text-charcoal" : ""}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <Link
                      href={`/packages#${tier.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
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
              <Image
                src="/4df1651bdc6530a4ccc9305c9365abc3.jpg"
                alt="Women supporting one another at different stages of life"
                width={1200}
                height={885}
                className="w-full rounded-[2rem] object-cover shadow-2xl"
              />
            </Reveal>

            <Reveal delay={120}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-soft">
                Our longer-term vision
              </p>
              <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
                Our vision for women&apos;s health.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/75">
                {siteConfig.shortName} exists to support women through every stage
                of life. That ambition is deliberately larger than what we offer
                today — and we will only ever describe as available what is
                genuinely available.
              </p>

              <div className="mt-10">
                <span className="inline-flex rounded-full bg-white px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-charcoal">
                  Available now
                </span>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {availableNow.map((service) => (
                    <li
                      key={service}
                      className="flex items-start gap-3 text-sm font-medium text-white/85"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral"
                        aria-hidden="true"
                      />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-9 border-t border-white/15 pt-8">
                <span className="inline-flex rounded-full border border-white/30 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/70">
                  Future vision
                </span>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {futureVision.map((service) => (
                    <li
                      key={service}
                      className="flex items-start gap-3 text-sm font-medium text-white/45"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25"
                        aria-hidden="true"
                      />
                      {service}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 max-w-lg text-sm leading-6 text-white/50">
                  These areas form part of our future vision. They are not available
                  to book today and will be announced as they launch.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Commissioning strip */}
      <section className="bg-primary-soft/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              For organisations and commissioners
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold text-charcoal md:text-3xl">
              Commissioning perinatal education and family-focused support
            </h2>
            <p className="mt-4 text-base leading-7 text-charcoal/70">
              Commission evidence-informed perinatal education and family-focused
              support designed to help parents feel informed, prepared and
              supported.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Link
              href="/commissioning"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Explore commissioning
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Purpose beyond our programmes */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Social impact
            </p>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
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
                  className="text-base font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
                >
                  Discover our social impact. ↗
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
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:py-28">
          <Reveal>
            <h2 className="font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              Feel informed. Feel prepared. Feel supported.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-charcoal/70">
              Begin with a complimentary 15-minute discovery call — a relaxed
              conversation about where you are in your journey, and the level of
              support that would genuinely suit you and your birth partner.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4">
              <Link
                href="/discovery"
                className="inline-flex items-center justify-center rounded-full bg-coral px-8 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary"
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
