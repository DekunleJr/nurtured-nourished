import Image from "next/image";
import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata = {
  title: "About Us",
  description:
    "Nurtured & Nourished Women's Health Ltd is a women's-health education company built on a simple belief: women deserve to feel informed, heard and supported as their health needs evolve throughout life.",
};

/** Company introduction — the first three paragraphs of the page. */
const intro = [
  "Nurtured & Nourished Women's Health Ltd is a women's-health education company built around a simple belief: women deserve to feel informed, heard and supported as their health needs evolve throughout life.",
  "We're beginning with pregnancy, birth, infant feeding and early parenthood—providing premium, evidence-informed education designed to turn uncertainty into understanding and preparation into confidence.",
  "Our vision reaches further: to grow responsibly into a trusted women's-health education and support brand across the reproductive life course.",
];

/** The founder — at launch the perinatal services are led and delivered by Favour. */
const founder = {
  name: "Favour Oloye",
  role: "Founder · Registered Nurse · Antenatal Educator",
  paragraphs: [
    "Nurtured & Nourished was founded by Favour Oloye, a Registered Nurse and antenatal educator with a passion for helping women and families feel better informed, prepared and supported through significant stages of life.",
    "Her approach brings together professional knowledge, evidence-informed education and an understanding that no two women's experiences are exactly the same.",
    "Rather than simply providing more information, Favour created Nurtured & Nourished to provide structured education that helps women understand their options, ask questions, prepare with confidence and make informed decisions that reflect their individual circumstances.",
    "At launch, Favour personally leads the company's perinatal education and support services, creating a deliberately personal experience while Nurtured & Nourished grows responsibly into its wider women's-health vision.",
  ],
  image: "/Favour_Oloye.png",
};

/** Why the company exists — professional knowledge meeting lived experience. */
const why = [
  "Professional knowledge can tell you what should happen. Lived experience can reveal how it actually feels.",
  "Through both her nursing background and her own experience of navigating maternity and infant feeding in the UK, Favour recognised how easily women can find themselves surrounded by information yet still feel uncertain, unheard or underprepared.",
  "Nurtured & Nourished Women's Health Ltd grew from a desire to bridge that gap: combining reliable education with thoughtful preparation, meaningful partner involvement and the space to ask questions without judgement.",
];

/** The five values behind every NNWH experience. */
const values = [
  {
    title: "Compassion",
    text: "We listen without judgement and recognise the individuality of every woman's experience.",
  },
  {
    title: "Empowerment",
    text: "We provide knowledge and preparation that support informed, confident decision-making.",
  },
  {
    title: "Excellence",
    text: "We are committed to high-quality education, professional standards and continuous learning.",
  },
  {
    title: "Integrity",
    text: "We communicate honestly, respect professional boundaries and remain transparent about what our services can—and cannot—provide.",
  },
  {
    title: "Continuity",
    text: "We believe women's health deserves attention beyond a single moment or milestone.",
  },
];

/** How the company grows — founder-led today, expert-led as services expand. */
const growth = [
  "Nurtured & Nourished Women's Health Ltd is currently founder-led, with services personally delivered by Favour within her professional competence and training.",
  "As the company expands into additional areas of women's health, appropriately qualified professionals will join the NNWH team to provide services within their own areas of expertise.",
  "We grow our services when the expertise, governance and professional standards are in place—not simply because there is a commercial opportunity to do so.",
];

/** What is available today, what is expanding, and the long-term ambition. */
const vision = {
  availableNow:
    "Perinatal education, birth preparation, partner education, infant-feeding preparation and early-postnatal support.",
  asWeGrow:
    "Nurtured & Nourished Women's Health Ltd will expand responsibly into additional areas of women's-health education as appropriate professional expertise, programmes and governance are established.",
  longTerm:
    "A trusted women's-health education brand supporting women through the reproductive life course—from earlier reproductive health through motherhood, midlife and menopause.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Eyebrow tone="dark">About Us</Eyebrow>
          <h1 className="display-1 mt-4 max-w-3xl font-serif font-semibold">
            Supporting women through every stage of life
          </h1>
          <div className="mt-6 max-w-3xl space-y-5 text-lg leading-8 text-white/85">
            {intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-start gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="relative">
              <div
                className="absolute -bottom-4 -left-4 h-full w-full rounded-[2rem] bg-peach/25"
                aria-hidden="true"
              />
              <Image
                src={founder.image}
                alt={`${founder.name}, ${founder.role}`}
                width={600}
                height={750}
                className="relative w-full rounded-[2rem] object-cover img-frame"
              />
            </div>
            <div>
              <Eyebrow>Meet the founder</Eyebrow>
              <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
                Professional knowledge. Human understanding.
              </h2>
              <p className="mt-6 font-serif text-2xl font-semibold text-charcoal">
                {founder.name}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-coral">
                {founder.role}
              </p>
              <div className="mt-6 space-y-4">
                {founder.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-lg leading-8 text-charcoal/70">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <div>
            <Eyebrow>Why Nurtured &amp; Nourished Women&apos;s Health Ltd</Eyebrow>
            <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
              Knowledge matters. So does how you feel receiving it.
            </h2>
            <div className="mt-5 space-y-4">
              {why.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-8 text-charcoal/70">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <Image
            src="/8d7f99a8686cadd1297dc252f313f28a.jpg"
            alt="Women supporting one another through pregnancy and early motherhood"
            width={1200}
            height={800}
            className="w-full rounded-[2rem] object-cover img-frame"
          />
        </div>
      </section>

      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <Eyebrow align="center">Our values</Eyebrow>
          <h2 className="display-2 mt-4 text-center font-serif font-semibold text-charcoal">
            What guides our work
          </h2>
          <p className="mt-4 text-center font-serif text-lg italic text-charcoal/60">
            The principles behind every NNWH experience.
          </p>
          <ol className="mt-14">
            {values.map((value, index) => (
              <li
                key={value.title}
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-t border-charcoal/10 py-7 first:border-t-0 sm:gap-x-10"
              >
                <span
                  className="font-serif text-3xl italic text-peach"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal">
                    {value.title}
                  </h3>
                  <p className="mt-2 max-w-xl leading-7 text-charcoal/70">
                    {value.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="display-2 text-center font-serif font-semibold text-charcoal">
            Founder-led. Designed to grow responsibly.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-charcoal/70">
            {growth.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 md:py-28">
          <h2 className="display-2 font-serif font-semibold">
            Women&apos;s health doesn&apos;t begin or end with motherhood.
          </h2>
          <div className="mt-10 space-y-8">
            <div>
              <span className="inline-flex rounded-full bg-white px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-charcoal">
                Available now
              </span>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/85">
                {vision.availableNow}
              </p>
            </div>
            <div>
              <span className="inline-flex rounded-full border border-white/30 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/80">
                As we grow
              </span>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/75">
                {vision.asWeGrow}
              </p>
            </div>
            <div className="border-t border-white/15 pt-8">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/50">
                Our long-term vision
              </span>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/60">
                {vision.longTerm}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h2 className="display-2 font-serif font-semibold text-charcoal">
            Your questions are welcome
          </h2>
          <p className="mt-4 text-lg leading-8 text-charcoal/70">
            If you&apos;re preparing for birth and wondering whether Nurtured &
            Nourished Women&apos;s Health Ltd is right for you, start with a
            complimentary 15-minute discovery call.
          </p>
          <Link
            href="/discovery"
            className="mt-8 inline-block rounded-full bg-coral px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_14px_30px_-14px_rgb(240_130_129/0.5)]"
          >
            Book your complimentary discovery call
          </Link>
        </div>
      </section>
    </>
  );
}
