import Image from "next/image";
import CommissioningForm from "@/components/CommissioningForm";

export const metadata = { title: "Commissioning & B2B" };

const roadmap = [
  {
    year: "Year 1",
    title: "Commissioned Maternity Cohorts",
    text: "Funded group cohorts delivering evidence-based perinatal education at scale across your region.",
  },
  {
    year: "Year 3",
    title: "Accredited CPD Programmes",
    text: "Continuing professional development programmes for the maternity and health workforce.",
  },
  {
    year: "Year 4",
    title: "Trauma-Informed Perinatal Health Screening Tool",
    text: "A validated screening approach that helps teams identify and respond to trauma with care.",
  },
  {
    year: "Year 5",
    title: "Culturally Safe Return-to-Work Audits",
    text: "Workplace audits that help employers build family-friendly, culturally safe policies that retain talent.",
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
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-soft">
            Commissioning & B2B
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold md:text-5xl">
            Perinatal education, commissioned with confidence
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            Nurtured & Nourished partners with NHS Trusts, Integrated Care Boards,
            local authorities and progressive employers to deliver clinically led
            perinatal education that measurably improves outcomes for staff, families
            and communities.
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
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Our roadmap
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              A clear five-year pathway
            </h2>
            <p className="mt-4 text-lg leading-8 text-charcoal/70">
              We’re building a phased product roadmap so commissioners can grow
              with us — from commissioned cohorts today to accredited programmes,
              screening and workplace audits in the years ahead.
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
                  <p className="text-xs font-bold uppercase tracking-widest text-coral">{step.year}</p>
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
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Start the conversation
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              Let’s talk commissioning
            </h2>
            <p className="mt-4 text-lg leading-8 text-charcoal/70">
              Share your goals and our team will come back with how we can support
              your families, workforce and community.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <CommissioningForm />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Image
            src="/9b4a4f049e6ddd14639d3e0b3f5008bb.jpg"
            alt="Health professionals and mothers talking together in a warm community setting"
            width={1200}
            height={801}
            className="w-full rounded-3xl object-cover shadow-lg"
          />
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              Why partners choose us
            </h2>
            <ul className="space-y-4 text-charcoal/75">
              <li className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white" aria-hidden="true">✓</span>
                <span><strong className="text-charcoal">Clinically led education</strong> delivered by experienced perinatal practitioners.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white" aria-hidden="true">✓</span>
                <span><strong className="text-charcoal">Online, nationwide reach</strong> with cohorts designed for small supportive groups.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white" aria-hidden="true">✓</span>
                <span><strong className="text-charcoal">Social impact built in</strong> — commercial partnerships fund free community support through our sister CIC.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white" aria-hidden="true">✓</span>
                <span><strong className="text-charcoal">A scalable five-year pathway</strong> from cohorts to accredited CPD and beyond.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}