import Image from "next/image";
import Link from "next/link";
import {
  PROGRAMME_NAME,
  PROGRAMME_SHORT,
  additionalSession,
  cohortSize,
  packages,
} from "@/lib/packages";

export const metadata = {
  title: "Perinatal Programmes",
  description:
    "Prepare for birth. Feel supported beyond it. The Favour Oloye Birth Confidence Programme™ — six weeks of live, interactive preparation for pregnancy, birth and early parenthood.",
};

/** Three facts shown beneath the hero, joined with separators. */
const heroFacts = [
  "Live online",
  cohortSize,
  "Birth partner or chosen supporter welcome",
  "Premium programme resources",
];

/** The six live sessions that make up FOBCP™. */
const weeks = [
  {
    week: "Week 1",
    title: "Understand your maternity journey",
    text: "Get to know how maternity care works in the UK, who may be involved in your care, how to navigate different care pathways and where to seek help when you need it.",
  },
  {
    week: "Week 2",
    title: "Understand your changing body",
    text: "Explore pregnancy physiology, common symptoms, nutrition, medicines, screening and tests, selected pregnancy complications and emotional wellbeing.",
  },
  {
    week: "Week 3",
    title: "Prepare for labour and birth",
    text: "Learn how labour may begin and progress, what happens in your body, and explore movement, breathing, relaxation, comfort measures and practical ways your birth partner or chosen supporter can help.",
  },
  {
    week: "Week 4",
    title: "Prepare for when birth takes another path",
    text: "Understand induction, monitoring, pain-relief options, assisted birth and Caesarean birth—so your preparation isn't limited to only one version of how birth might unfold.",
  },
  {
    week: "Week 5",
    title: "Prepare for the fourth trimester",
    text: "Explore recovery after birth, infant feeding, newborn care, safer sleep, maternal wellbeing and the practical support that can make early parenthood feel less overwhelming.",
  },
  {
    week: "Week 6",
    title: "Bring it all together",
    text: "Turn what you've learned into practical preparation for birth and early parenthood—from your preferences and communication to transport, childcare, your hospital bag, your support network and what happens next.",
  },
];

/** The four connected dimensions of the FOBCP™ approach. */
const approach = [
  {
    dimension: "Body",
    text: "Understand your body, pregnancy, birth, care pathways and the practical knowledge that supports informed preparation.",
  },
  {
    dimension: "Soul",
    text: "Make space for emotions, confidence, identity, previous experiences, relationships and psychological wellbeing.",
  },
  {
    dimension: "Spirit",
    text: "Recognise the values, beliefs, faith, meaning and sources of hope that matter to you—without pressure or promises about outcomes.",
  },
  {
    dimension: "Village",
    text: "Prepare the people and support around you, including your birth partner or chosen supporter, family, maternity professionals and wider support network.",
  },
];

/** How the instalment position changes as the programme start approaches. */
const paymentWindows = [
  {
    timing: "Booking 8 or more weeks before your programme begins",
    terms: "Pay in full or in up to 3 interest-free payments.",
  },
  {
    timing: "Booking 4–8 weeks before your programme begins",
    terms: "Pay in full or in up to 2 interest-free payments.",
  },
  {
    timing: "Booking less than 4 weeks before your programme begins",
    terms: "Payment in full.",
  },
];

export default function PackagesPage() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Perinatal programmes
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            Prepare for birth. Feel supported beyond it.
          </h1>
          <div className="mx-auto mt-6 max-w-2xl space-y-4 text-lg leading-8 text-charcoal/70">
            <p>
              Pregnancy brings questions. Birth brings choices. And becoming a
              parent doesn&apos;t stop at the moment your baby arrives.
            </p>
            <p>
              At Nurtured &amp; Nourished, our perinatal programme combines
              structured birth preparation with practical education, meaningful
              partner involvement and continued support into the postnatal period.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-20">
          <div className="rounded-3xl border border-charcoal/10 bg-white p-8 text-left shadow-sm sm:p-10">
            <h2 className="font-serif text-2xl font-semibold text-charcoal md:text-3xl">
              {PROGRAMME_NAME}
            </h2>
            <p className="mt-4 text-lg font-medium leading-8 text-primary">
              Six weeks of live, interactive preparation for pregnancy, birth and
              early parenthood.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#fobcp"
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Explore {PROGRAMME_SHORT}
              </Link>
              <Link
                href="/discovery"
                className="inline-flex items-center justify-center rounded-full border border-primary/40 px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
              >
                Book a complimentary discovery call
              </Link>
            </div>
            <p className="mt-6 text-sm leading-6 text-charcoal/60">
              {heroFacts.join(" · ")}
            </p>
          </div>
        </div>
      </section>

      <section id="fobcp" className="scroll-mt-32 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            More than preparing for the day you give birth.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-charcoal/70">
            <p>
              The Favour Oloye Birth Confidence Programme™ (FOBCP™) is designed to
              help you understand what is happening, explore your options, prepare for
              different possibilities and feel more confident communicating about the
              care that matters to you.
            </p>
            <p>
              Across six live, interactive weeks, we bring together practical
              knowledge, emotional preparation, informed decision-making, partner
              involvement and preparation for the early weeks with your baby.
            </p>
            <p>
              You won&apos;t be told there is one &ldquo;right&rdquo; way to give
              birth, feed your baby or become a parent.
            </p>
            <p>
              Instead, you&apos;ll be supported to understand your options, identify
              what matters to you and prepare to navigate your own experience with
              greater clarity and confidence.
            </p>
          </div>
        </div>
      </section>

      <section id="journey" className="scroll-mt-32 bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">
            Your six-week journey
          </p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Six weeks. One connected journey.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weeks.map((week, index) => (
              <div
                key={week.week}
                className="flex flex-col rounded-2xl border border-charcoal/10 bg-white p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
                    {week.week}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-charcoal">
                  {week.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-charcoal/70">{week.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="approach" className="scroll-mt-32 bg-primary-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">
            The FOBCP™ approach
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-center font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Birth preparation is about more than knowing the stages of labour.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-charcoal/70">
            FOBCP™ approaches preparation through four connected dimensions.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {approach.map((item) => (
              <div key={item.dimension} className="rounded-2xl bg-white p-7 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
                  {item.dimension}
                </h3>
                <p className="mt-4 text-sm leading-7 text-charcoal/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="voice" className="scroll-mt-32 bg-charcoal text-white">
        <div className="mx-auto max-w-3xl px-4 py-20 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-soft">
            Find your VOICE™
          </p>
          <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
            A framework for navigating decisions with greater confidence.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-white/75">
            <p>
              Pregnancy and birth can bring choices and conversations you
              weren&apos;t expecting.
            </p>
            <p>
              <span className="font-semibold text-white">FOBCP VOICE™</span> is the
              programme&apos;s decision framework, designed to support you as you
              explore your options, consider what matters to you and participate
              meaningfully in conversations about your care.
            </p>
            <p>
              Throughout FOBCP™, you&apos;ll learn how to use the framework in
              different situations as you prepare for pregnancy, birth and early
              parenthood.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Your supporter is part of the preparation too.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-charcoal/70">
            <p>
              Birth partners and chosen supporters are welcome throughout the
              programme.
            </p>
            <p>
              Rather than standing at the side wondering what to do, they are
              encouraged to understand the journey alongside you, practise ways to
              support you and prepare for their role during labour, birth and the
              transition into early parenthood.
            </p>
            <p className="font-serif text-xl font-semibold text-charcoal">
              Coming alone? That&apos;s absolutely fine too.
            </p>
            <p>
              Having a partner or supporter is never a condition of taking part in
              FOBCP™.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Small by design.
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Five women. Space to participate.
          </h2>
          <p className="mt-6 text-lg leading-8 text-charcoal/70">
            Each live online FOBCP™ cohort is limited to{" "}
            <strong className="font-semibold text-charcoal">five women</strong>, with
            each participant welcome to bring a birth partner or chosen supporter.
          </p>
          <p className="mt-5 text-lg leading-8 text-charcoal/70">
            Keeping cohorts intentionally small creates room for questions,
            conversation, practical learning and meaningful participation while
            preserving the shared experience of preparing alongside other families.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Something tangible, even when you join online.
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              Your FOBCP™ programme materials
            </h2>
            <p className="mt-6 text-lg leading-8 text-charcoal/70">
              FOBCP™ isn&apos;t an online programme where everything disappears when
              the call ends.
            </p>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">
              Your programme experience includes physical FOBCP™ resources delivered
              to you before Week 1, designed to support learning, reflection and
              preparation throughout the programme and beyond.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="rounded-3xl border border-charcoal/10 bg-cream p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Questions don&apos;t always wait until the next class.
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              WhatsApp Programme Support
            </h2>
            <p className="mt-6 text-lg leading-8 text-charcoal/70">
              During your six-week FOBCP™ programme, you&apos;ll have access to
              WhatsApp Programme Support for brief programme-related questions and
              clarification between sessions.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 text-center">
                <p className="text-lg font-semibold text-charcoal">
                  Monday–Friday, 9am–5pm
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center">
                <p className="text-lg font-semibold text-charcoal">
                  Responses within one working day
                </p>
              </div>
            </div>
            <p className="mt-5 text-base leading-7 text-charcoal/65">
              Messages can be sent outside support hours and will be reviewed during
              the next support period.
            </p>
            <p className="mt-4 text-sm leading-6 text-charcoal/55">
              WhatsApp Programme Support is available during the six-week programme
              only. It is not continuously monitored and is not intended for urgent or
              emergency medical concerns.
            </p>
          </div>
        </div>
      </section>

      <section id="options" className="scroll-mt-32 bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">
            Choose your level of support
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-center font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            One complete programme. Three levels of postnatal support.
          </h2>
          <div className="mx-auto mt-5 max-w-2xl space-y-4 text-center text-lg leading-8 text-charcoal/70">
            <p>
              Every Maternal option includes the same complete six-week Favour Oloye
              Birth Confidence Programme™. Your choice does not change the FOBCP™
              curriculum you receive.
            </p>
            <p>
              What changes is the amount of private postnatal support available to you
              after your baby arrives.
            </p>
          </div>

          <div className="mt-14 grid items-stretch gap-8 md:grid-cols-3">
            {packages.map((p) => (
              <div
                key={p.slug}
                id={p.slug}
                className="flex scroll-mt-32 flex-col rounded-3xl border border-charcoal/10 bg-white p-8"
              >
                <h3 className="text-center text-2xl font-bold text-charcoal">{p.name}</h3>
                <p className="mt-2 text-center font-serif text-lg italic text-primary">
                  {p.tagline}
                </p>
                <p className="mt-5 text-center text-4xl font-bold text-primary">{p.price}</p>
                <p className="mt-4 text-center text-sm leading-6 text-charcoal/65">
                  {p.blurb}
                </p>
                <p className="mt-7 text-sm font-semibold text-charcoal">
                  Your {p.name} experience includes:
                </p>
                <ul className="mt-4 flex flex-col gap-3 text-sm leading-6 text-charcoal/80">
                  {p.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white"
                        aria-hidden="true"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className={feature.emphasis ? "font-semibold text-charcoal" : ""}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex-1" />
                <Link
                  href={`/discovery?package=${p.slug}`}
                  className="rounded-full bg-primary px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  {p.cta}
                </Link>
                <p className="mt-4 text-center text-xs italic leading-5 text-charcoal/55">
                  {p.priceNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="payment" className="scroll-mt-32 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">
            A little more flexibility.
          </p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Payment options
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-8 text-charcoal/70">
            You can pay for your Maternal programme in full or, where your booking
            date allows, spread the cost with interest-free instalments.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {paymentWindows.map((option) => (
              <div
                key={option.timing}
                className="rounded-2xl border border-charcoal/10 bg-cream p-7"
              >
                <p className="font-semibold text-charcoal">{option.timing}</p>
                <p className="mt-3 text-sm leading-6 text-charcoal/70">{option.terms}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-7 text-charcoal/65">
            Your first payment is taken when you book. Any remaining payments are
            collected automatically, with the full programme fee due before Week 1.
          </p>
        </div>
      </section>

      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Need a little more support?
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-charcoal/70">
            Existing Maternal clients can purchase an additional private postnatal
            support session, subject to availability.
          </p>
          <div className="mt-10 rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">
              {additionalSession.name}
            </h2>
            <p className="mt-4 text-4xl font-bold text-primary">
              {additionalSession.price}
            </p>
            <p className="mt-3 text-base text-charcoal/70">
              {additionalSession.availability}
            </p>
            <Link
              href="/discovery"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {additionalSession.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            And after the babies arrive…
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Come back together.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-charcoal/70">
            <p>
              Where scheduled, your cohort will be invited to an optional{" "}
              <strong className="font-semibold text-charcoal">
                Postnatal Reunion
              </strong>{" "}
              after the babies have arrived.
            </p>
            <p>
              It&apos;s an opportunity to reconnect with the women and supporters you
              spent six weeks learning alongside, reflect on the transition into early
              parenthood and bring the FOBCP™ journey together.
            </p>
          </div>
        </div>
      </section>

      <section id="cohorts" className="scroll-mt-32 bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            When should I join?
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Finding the right cohort for your pregnancy.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-charcoal/70">
            <p>
              The standard FOBCP™ entry window is designed around beginning Week 1
              between approximately{" "}
              <strong className="font-semibold text-charcoal">
                24 and 32+6 weeks of pregnancy
              </strong>
              .
            </p>
            <p>
              If you are earlier or later in pregnancy, that doesn&apos;t
              automatically mean FOBCP™ isn&apos;t suitable for you. We may simply
              need to discuss which available route or cohort is most appropriate for
              your timing.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/discovery"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Choose your cohort &amp; book
            </Link>
            <Link
              href="/discovery"
              className="inline-flex items-center justify-center rounded-full border border-primary/40 px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
            >
              Not sure? Book a complimentary discovery call
            </Link>
          </div>
        </div>
      </section>
    <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-start gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <Image
              src="/Favour_Oloye.png"
              alt="Favour Oloye, Registered Nurse and Antenatal Educator, founder of Nurtured & Nourished"
              width={600}
              height={750}
              className="w-full rounded-3xl object-cover shadow-lg"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Professional knowledge. Personal support.
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
                Meet Favour Oloye
              </h2>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-coral">
                Registered Nurse · Antenatal Educator · Founder of Nurtured &amp;
                Nourished
              </p>
              <div className="mt-6 space-y-5 text-lg leading-8 text-charcoal/70">
                <p>
                  Your programme is delivered live by Favour, bringing professional
                  knowledge together with structured, evidence-informed education and
                  a supportive environment where questions are welcome.
                </p>
                <p>
                  As Nurtured &amp; Nourished grows, appropriately qualified
                  professionals may join the delivery team within their own areas of
                  competence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-soft/40">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-charcoal/10 bg-white p-8 sm:p-10">
            <h2 className="font-serif text-2xl font-semibold text-charcoal md:text-3xl">
              Education, preparation and support.
            </h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-charcoal/70">
              <p>
                FOBCP™ provides education and preparation. It does not replace
                personalised care from your midwife, maternity team, GP, health
                visitor, infant-feeding service, mental-health professional or other
                healthcare professional.
              </p>
              <p>
                Nurtured &amp; Nourished does not use the programme to diagnose
                conditions, prescribe treatment or promise a particular pregnancy,
                birth or feeding outcome.
              </p>
              <p>
                We can help you understand, prepare, ask questions, explore your
                options and know when and where to seek appropriate professional
                support.
              </p>
              <p className="rounded-2xl bg-primary-soft/60 p-5 font-medium text-charcoal">
                If you are concerned about your health or your baby&apos;s health, or
                think urgent assessment may be needed, please contact the appropriate
                maternity, NHS or emergency service rather than waiting for a response
                from Nurtured &amp; Nourished.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Prepare with knowledge. Move forward with confidence.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/75">
            Choose the level of postnatal support that feels right for you and join an
            upcoming FOBCP™ cohort.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/discovery"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-peach"
            >
              Choose your cohort &amp; book
            </Link>
            <Link
              href="/discovery"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Book a complimentary 15-minute discovery call
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}