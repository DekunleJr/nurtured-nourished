import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the Nurtured & Nourished website and services.",
};

export default function TermsPage() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h1 className="font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Last updated: September 2026
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="prose prose-charcoal max-w-none space-y-8 text-charcoal/80">
            <div>
              <h2 className="text-2xl font-bold text-charcoal">1. Introduction</h2>
              <p className="mt-3 leading-7">
                Welcome to Nurtured & Nourished Women&apos;s Health Ltd. These Terms of Service
                govern your use of our website and services. By accessing or using our website,
                you agree to be bound by these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">2. Our Services</h2>
              <p className="mt-3 leading-7">
                We provide perinatal education, birth preparation, postnatal support, and infant
                feeding support through online group programmes, one-to-one coaching, and
                commissioned services.
              </p>
              <p className="mt-3 leading-7">
                Our services are educational and supportive in nature. We do not provide medical
                advice, diagnosis, or treatment.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">3. Booking and Payment</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>All bookings are subject to availability</li>
                <li>Prices are as displayed on our website</li>
                <li>Payment is required at the time of booking</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">4. Cancellation and Refunds</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>14+ days before: full refund</li>
                <li>7-13 days before: 50% refund</li>
                <li>Less than 7 days: non-refundable</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
