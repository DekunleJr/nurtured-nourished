import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description: "Meet the team behind Nurtured & Nourished and learn about our mission.",
};

const team = [
  {
    name: "Founder & Lead Practitioner",
    role: "Perinatal Education Specialist",
    bio: "Passionate about empowering women through evidence-based education and compassionate support.",
  },
  {
    name: "Clinical Support",
    role: "Maternity Support Worker",
    bio: "Dedicated to providing practical, judgement-free guidance for infant feeding and postnatal recovery.",
  },
  {
    name: "Community Lead",
    role: "Community Engagement",
    bio: "Building bridges between our commercial services and the communities that benefit from our CIC.",
  },
];

const milestones = [
  { year: "2020", text: "Nurtured & Nourished founded" },
  { year: "2022", text: "Launched online perinatal programmes" },
  { year: "2024", text: "Go Nurture Initiative CIC established" },
  { year: "2026", text: "Expanding across the UK" },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-soft">
            About Us
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold md:text-5xl">
            Supporting women through every stage of life
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            We believe every woman deserves access to expert perinatal education and
            compassionate support — regardless of background or circumstance.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Image
            src="/8d7f99a8686cadd1297dc252f313f28a.jpg"
            alt="Nurtured & Nourished team supporting mothers"
            width={1200}
            height={800}
            className="w-full rounded-3xl object-cover shadow-lg"
          />
          <div>
            <h2 className="font-serif text-3xl font-semibold text-charcoal md:text-4xl">
              Our Story
            </h2>
            <p className="mt-4 text-lg leading-8 text-charcoal/70">
              Nurtured & Nourished was founded with a simple mission: to make expert
              perinatal education accessible to every family. We saw too many parents
              feeling overwhelmed and underprepared, and knew there had to be a better way.
            </p>
            <p className="mt-4 text-lg leading-8 text-charcoal/70">
              Today, we deliver live online programmes, one-to-one coaching, and
              commissioned services across the UK — and through our sister CIC, we
              provide free support to vulnerable women in Norfolk.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Our Values
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-primary-soft p-8">
              <h3 className="text-xl font-bold text-primary">Compassion</h3>
              <p className="mt-3 text-charcoal/70">
                We listen without judgement and support every family&apos;s unique journey.
              </p>
            </div>
            <div className="rounded-2xl bg-primary-soft p-8">
              <h3 className="text-xl font-bold text-primary">Empowerment</h3>
              <p className="mt-3 text-charcoal/70">
                We help parents feel confident in their decisions and capabilities.
              </p>
            </div>
            <div className="rounded-2xl bg-primary-soft p-8">
              <h3 className="text-xl font-bold text-primary">Excellence</h3>
              <p className="mt-3 text-charcoal/70">
                Committed to quality, professionalism and continuous improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Meet the Team
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-xl font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
                <h3 className="mt-4 text-lg font-bold text-charcoal">{member.name}</h3>
                <p className="text-sm font-medium text-primary">{member.role}</p>
                <p className="mt-3 text-sm leading-6 text-charcoal/65">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            Our Journey
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m) => (
              <div key={m.year} className="rounded-2xl border border-charcoal/10 bg-cream p-6 text-center">
                <p className="text-2xl font-bold text-primary">{m.year}</p>
                <p className="mt-2 text-sm text-charcoal/70">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="font-serif text-3xl font-semibold text-charcoal">
            Ready to start your journey?
          </h2>
          <p className="mt-4 text-lg text-charcoal/70">
            Book a free discovery call and let us recommend the right support for you.
          </p>
          <Link
            href="/discovery"
            className="mt-6 inline-block rounded-full bg-coral px-8 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary"
          >
            Book your discovery call
          </Link>
        </div>
      </section>
    </>
  );
}
