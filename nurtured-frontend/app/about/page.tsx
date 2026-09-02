import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description: "Meet the team behind Nurtured & Nourished and learn about our mission.",
};

const team = [
  {
    name: "Favour Oloye",
    role: "Founder Director and Chief Executive",
    bio: "Registered Nurse, Antenatal Educator and trainee Lactation Consultant. Favour founded GNI from her professional knowledge, community insight and lived experience of navigating maternity and infant feeding in the UK. She leads programme development, partnerships and delivery.",
    image: "/Favour_Oloye.png",
  },
  {
    name: "Amarachi Chidi",
    role: "Non-Executive Director",
    bio: "A qualified accountant who contributes financial oversight, governance and sustainability expertise.",
    image: "/Amarachi_Chidi.png",
  },
  {
    name: "Christianah Obiseson",
    role: "Non-Executive Director",
    bio: "A cybersecurity professional who contributes data-protection, digital-safety and systems expertise.",
    image: "/Christianah_Obiseson.png",
  },
  {
    name: "Marion Frey-AlQurashi",
    role: "Founding Member",
    bio: "Marion is a Certified Lactation Specialist, Breastfeeding Counsellor and Mindful Breastfeeding Practitioner, and Director of Breastfeeding Support Norwich & Norfolk. She offers warm, evidence-based breastfeeding and lactation support to families across Norwich and Norfolk. She's passionate about supporting families and committed to inclusive, culturally sensitive care.",
    image: "/Marion.png",
  },
  {
    name: "Abimbola Hundogan",
    role: "Founding Member",
    bio: "Registered Nurse and Registered Midwife. Abimbola is deeply passionate about maternal health and advocating for women from BAME and Displaced backgrounds. She brings clinical expertise and a warm, culturally aware approach to our perinatal education, helping women feel seen, heard, and supported.",
    image: "/Abimbola_Hundogan.png",
  },
  {
    name: "Grace Sanni",
    role: "Founding Member",
    bio: "Registered Nurse with a heart for community health. Grace is passionate about breaking down barriers to care for women in our target communities. She supports the delivery of our free education and feeding support, ensuring every woman receives practical help with dignity and respect.",
    image: "/Grace_Sanni.png",
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
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="rounded-2xl bg-white shadow-sm">
                <div className="relative h-96 w-full overflow-hidden rounded-xl">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={600}
                    height={250}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-center text-lg font-bold text-charcoal">{member.name}</h3>
                <p className="text-center text-sm font-medium text-primary">{member.role}</p>
                <p className="m-6 text-sm leading-6 text-charcoal/65">{member.bio}</p>
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
