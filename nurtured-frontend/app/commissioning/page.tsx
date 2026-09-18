import Eyebrow from "@/components/ui/Eyebrow";
import CheckDot from "@/components/ui/CheckDot";
import Frame from "@/components/ui/Frame";
import CommissioningForm from "@/components/CommissioningForm";

export const metadata = {
  title: "Commissioning & B2B",
  description:
    "Commission evidence-informed perinatal education and family-focused support designed to help parents feel informed, prepared and supported.",
};

/**
 * Intended growth pathway. Nothing below is claimed as available today — each
 * stage is announced only once capacity, accreditation and partnerships allow.
 */
const roadmap = [
  {
    year: "Year 1",
    title: "Commissioned maternity cohorts",
    text: "Funded group cohorts of our FOBCP perinatal programme, delivered for the parents you serve.",
  },
  {
    year: "Year 3",
    title: "Continuing professional development",
    text: "CPD for the maternity and health workforce, with accreditation as the goal.",
  },
  {
    year: "Year 4",
    title: "Trauma-informed perinatal screening",
    text: "A screening approach in development, intended to help teams identify and respond to trauma with care.",
  },
  {
    year: "Year 5",
    title: "Culturally safe return-to-work reviews",
    text: "Workplace reviews intended to help employers build family-friendly, culturally safe policies.",
  },
];

const audiences = [
  "NHS Trusts & ICS/ICBs",
  "Local authorities",
  "Corporate & HR teams",
  "Family-friendly workplace programmes",
];

export default function CommissioningPage() {
  return (
    <>
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Eyebrow tone="dark">Commissioning &amp; B2B</Eyebrow>
          <h1 className="display-1 mt-4 max-w-3xl font-serif font-semibold">
            Perinatal education, commissioned with confidence
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            Nurtured & Nourished is available to work with NHS Trusts, Integrated
            Care Boards, local authorities and employers to commission
            evidence-informed perinatal education and family-focused support
            designed to help parents feel informed, prepared and supported.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {audiences.map((a) => (
              <span key={a} className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <div>
            <Eyebrow>Our roadmap</Eyebrow>
            <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
              Our intended five-year pathway
            </h2>
            <p className="mt-4 text-lg leading-8 text-charcoal/70">
              This roadmap describes where we intend to grow, in phases, as capacity
              and accreditation allow. It is a statement of intent rather than a
              catalogue of services available today.
            </p>
          </div>
          <div className="grid gap-4">
            {roadmap.map((step, i) => (
              <div key={step.year} className="flex gap-4 rounded-2xl border border-charcoal/10 bg-white p-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  {i < roadmap.length - 1 && <span className="mt-2 w-px flex-1 bg-primary/30" aria-hidden="true" />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">{step.year}</p>
                  <h3 className="mt-1 font-bold text-charcoal">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-charcoal/65">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow align="center">Start the conversation</Eyebrow>
            <h2 className="display-2 mt-4 font-serif font-semibold text-charcoal">
              Let’s talk commissioning
            </h2>
            <p className="mt-4 text-lg leading-8 text-charcoal/70">
              Share your goals and Favour will come back to you personally with how
              we could support your families, workforce and community — including an
              honest view of what we can and cannot deliver today.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <CommissioningForm />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Frame
            src="/9b4a4f049e6ddd14639d3e0b3f5008bb.jpg"
            alt="Health professionals and mothers talking together in a warm community setting"
            width={1200}
            height={801}
          />
          <div className="space-y-6">
            <h2 className="display-2 font-serif font-semibold text-charcoal">
              Why partners choose us
            </h2>
            <ul className="space-y-4 text-charcoal/75">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  <CheckDot size="sm" />
                </span>
                <span><strong className="text-charcoal">Founder-led delivery</strong> — every programme is taught by a Registered Nurse and Antenatal Educator.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  <CheckDot size="sm" />
                </span>
                <span><strong className="text-charcoal">Online, UK-wide reach</strong> — cohorts are kept small and supportive, and birthing partners are included by design.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  <CheckDot size="sm" />
                </span>
                <span><strong className="text-charcoal">Transparent social impact</strong> — we work alongside the Go Nurture Initiative CIC, an independently operated community interest company, and describe our contribution only in terms we can evidence.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  <CheckDot size="sm" />
                </span>
                <span><strong className="text-charcoal">Room to grow with you</strong> — a phased pathway from commissioned cohorts towards continuing professional development.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}