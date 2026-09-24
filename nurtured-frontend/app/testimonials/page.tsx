import Link from "next/link";
import { fetchDynamicTestimonials } from "@/lib/testimonials";

export const metadata = {
  title: "Testimonials",
  description: "Read what our clients say about their experience with Nurtured & Nourished.",
};

export default async function TestimonialsPage() {
  // Live client words from the admin-managed content API. Null = the API is
  // unreachable; [] = nothing published. Either way there is no static
  // fallback — the empty state below renders instead.
  const testimonials = (await fetchDynamicTestimonials()) ?? [];
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="display-1 font-serif font-semibold text-charcoal">
            What Our Clients Say
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Real stories from real families who have experienced our support.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {testimonials.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-[2rem] border border-charcoal/10 bg-white p-10 text-center shadow-sm sm:p-12">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft"
                aria-hidden="true"
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h2 className="mt-6 font-serif text-2xl font-semibold text-charcoal">
                Family stories coming soon
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-7 text-charcoal/60">
                We are gathering words from the families we support. When
                you&apos;re ready to explore your options, the next step is a
                complimentary 15-minute discovery call.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/discovery"
                  className="rounded-full bg-coral px-8 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary"
                >
                  Book a discovery call
                </Link>
                <Link
                  href="/packages"
                  className="rounded-full border-2 border-primary px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  View packages
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={`${t.id}-${t.sort_order}`} className="rounded-[2rem] bg-white p-8 card-lift">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f08281" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-charcoal/80 leading-7">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 border-t border-charcoal/10 pt-4">
                    <p className="font-semibold text-charcoal">{t.name}</p>
                    <p className="text-sm text-charcoal/60">{t.location} &middot; {t.package}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="display-2 font-serif font-semibold text-charcoal">
            Ready when you are.
          </h2>
          <p className="mt-4 text-lg text-charcoal/70">
            Every family&apos;s journey is different. When you&apos;re ready to explore your
            options, the next step is a complimentary 15-minute discovery call.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/discovery"
              className="rounded-full bg-coral px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_14px_30px_-14px_rgb(43_156_142/0.5)]"
            >
              Book a discovery call
            </Link>
            <Link
              href="/packages"
              className="rounded-full border-2 border-primary px-8 py-4 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              View packages
            </Link>
          </div>
        </div>
      </section>
     </>
  );
}
