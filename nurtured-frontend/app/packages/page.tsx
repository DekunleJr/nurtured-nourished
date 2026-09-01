import Link from "next/link";
import { packages } from "@/lib/packages";

export const metadata = { title: "Maternity Packages" };

const comparison = [
  { label: "Six-week live online group programme", vals: ["yes", "yes", "one-to-one"] },
  { label: "Dedicated partner session", vals: ["yes", "yes", "yes"] },
  { label: "Email updates throughout", vals: ["yes", "yes", "yes"] },
  { label: "Active WhatsApp support", vals: ["yes", "yes", "yes"] },
  { label: "One-to-one postnatal support sessions", vals: ["1 × 45 min (within 6 weeks)", "3 × 45 min (birth to 12 weeks)", "4 × 45 min (birth to 6 months)"] },
  { label: "Individualised one-to-one programme", vals: ["—", "—", "6 weeks of 1:1 birth preparation"] },
];

export default function PackagesPage() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            B2C maternity packages
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            Find the package for your journey
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-charcoal/70">
            Three ways to prepare for birth and beyond, each delivered live online
            with small, supportive cohorts. Every package includes a dedicated
            partner session — because you’re a team.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-stretch gap-8 md:grid-cols-3">
            {packages.map((p) => (
              <div
                key={p.slug}
                id={p.slug}
                className={`relative scroll-mt-32 flex flex-col rounded-3xl p-8 ${
                  p.flagship
                    ? "border-2 border-coral bg-white shadow-xl md:-my-4 md:py-12"
                    : "border border-charcoal/10 bg-white"
                }`}
              >
                {p.flagship && (
                  <span className="inline-flex self-center rounded-full bg-coral px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                    Flagship Programme
                  </span>
                )}
                <h2 className={`mt-5 text-center text-2xl font-bold ${p.flagship ? "text-primary" : "text-charcoal"}`}>
                  {p.name}
                </h2>
                <p className="mt-3 text-center text-5xl font-extrabold text-charcoal">
                  {p.price}
                </p>
                {p.flagship && (
                  <p className="mt-2 text-center text-sm font-semibold uppercase tracking-wider text-coral">
                    Most popular
                  </p>
                )}
                <p className="mt-4 text-center text-sm leading-6 text-charcoal/65">{p.blurb}</p>
                <ul className="mt-6 flex flex-col gap-3 text-sm text-charcoal/80">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${p.flagship ? "bg-coral" : "bg-primary"}`} aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex-1" />
                <Link
                  href={`/discovery?package=${p.slug}`}
                  className={`rounded-full px-6 py-3.5 text-center text-sm font-semibold text-white ${
                    p.flagship
                      ? "bg-coral shadow-md hover:bg-primary"
                      : "bg-primary hover:bg-primary-dark"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-base text-charcoal/70">
            Birthing partners are welcome throughout all programme deliveries and
            are highly encouraged to attend the dedicated partner sessions.
          </p>

          <div className="mt-12 overflow-x-auto">
            <h2 className="mb-6 text-center font-serif text-2xl font-semibold text-charcoal md:text-3xl">
              Compare at a glance
            </h2>
            <table className="w-full min-w-[640px] border-separate border-spacing-0 rounded-2xl border border-charcoal/10 bg-white text-left text-sm">
              <thead>
                <tr>
                  <th className="rounded-tl-2xl border-b border-charcoal/10 bg-cream p-4 text-charcoal/60">Included</th>
                  {packages.map((p) => (
                    <th key={p.slug} className={`border-b border-charcoal/10 p-4 text-center font-bold ${p.flagship ? "bg-primary-soft text-primary" : "bg-cream text-charcoal"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label}>
                    <td className="border-b border-charcoal/5 p-4 font-medium text-charcoal">{row.label}</td>
                    {row.vals.map((v, i) => (
                      <td key={i} className={`border-b border-charcoal/5 p-4 text-center ${packages[i].flagship ? "bg-primary-soft/50" : ""}`}>
                        {v === "yes" ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white" aria-label="Included">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="bg-primary text-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
              <h2 className="font-serif text-3xl font-semibold">Not sure which is right for you?</h2>
              <p className="max-w-xl text-lg leading-8 text-white/85">
                Book a free 15-minute discovery call and we’ll talk through your
                journey and recommend the package that fits.
              </p>
              <Link
                href="/discovery"
                className="rounded-full bg-white px-8 py-4 text-base font-semibold text-primary transition-colors hover:bg-peach"
              >
                Book your discovery call
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}