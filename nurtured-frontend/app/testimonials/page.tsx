import Link from "next/link";

export const metadata = {
  title: "Testimonials",
  description: "Read what our clients say about their experience with Nurtured & Nourished.",
};

const testimonials = [
  {
    name: "Sarah M.",
    location: "London",
    package: "Maternal Confidence",
    quote: "The support I received was incredible. I felt so much more confident going into birth knowing I had a team behind me. The online format meant I could attend from home with my newborn.",
  },
  {
    name: "Emma & James",
    location: "Manchester",
    package: "Maternal Premium",
    quote: "As first-time parents, we were nervous about everything. The one-to-one sessions gave us personalised guidance that made all the difference. Highly recommend!",
  },
  {
    name: "Priya K.",
    location: "Birmingham",
    package: "Maternal Essential",
    quote: "The group programme was so welcoming. I made friends with other parents at the same stage, and the WhatsApp support between sessions was a lifeline.",
  },
  {
    name: "Rachel T.",
    location: "Norfolk",
    package: "Maternal Confidence",
    quote: "The partner session was brilliant — my husband finally understood how to support me during labour. We felt like a real team afterwards.",
  },
  {
    name: "Aisha B.",
    location: "Leeds",
    package: "Maternal Essential",
    quote: "Being a migrant mum in a new country, I felt isolated. Nurtured & Nourished made me feel seen and supported. The cultural sensitivity was appreciated.",
  },
  {
    name: "NHS Commissioner",
    location: "East of England",
    package: "Commissioned Programme",
    quote: "Working with Nurtured & Nourished has transformed our staff wellbeing offering. The outcomes speak for themselves — reduced stress, improved retention.",
  },
];

export default function TestimonialsPage() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            What Our Clients Say
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Real stories from real families who have experienced our support.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 shadow-sm">
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
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="font-serif text-3xl font-semibold text-charcoal">
            Join hundreds of happy families
          </h2>
          <p className="mt-4 text-lg text-charcoal/70">
            Ready to experience the difference expert perinatal education can make?
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/discovery"
              className="rounded-full bg-coral px-8 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary"
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
