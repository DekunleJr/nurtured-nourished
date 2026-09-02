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
            Last updated: {siteConfig.reviewDate}
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="prose prose-charcoal max-w-none space-y-8 text-charcoal/80">
            <div>
              <h2 className="text-2xl font-bold text-charcoal">1. Introduction</h2>
              <p className="mt-3 leading-7">
                Welcome to {siteConfig.name}. These Terms of Service (&quot;Terms&quot;) govern your use of our
                website and services. By accessing or using our website, you agree to be bound by these Terms.
              </p>
              <p className="mt-3 leading-7">
                Our company registration number is {siteConfig.companyNumber} and our registered office is {siteConfig.registeredOffice}.
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
                <strong>Important:</strong> Our services are educational and supportive in nature. We do not provide medical
                advice, diagnosis, or treatment. Always consult a qualified healthcare professional
                for medical concerns.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">3. Booking and Payment</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>All bookings are subject to availability</li>
                <li>Prices are as displayed on our website and may be updated from time to time</li>
                <li>Payment is required at the time of booking unless otherwise agreed</li>
                <li>We accept payment via the methods specified on our website</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">4. Cancellation and Refunds</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Cancellations made 14 days or more before the programme start date are eligible for a full refund</li>
                <li>Cancellations made 7-13 days before may be eligible for a 50% refund</li>
                <li>Cancellations made less than 7 days before are non-refundable</li>
                <li>We reserve the right to reschedule sessions with reasonable notice</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">5. Your Responsibilities</h2>
              <p className="mt-3 leading-7">When using our services, you agree to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Provide accurate and complete information</li>
                <li>Attend scheduled sessions or provide reasonable notice of cancellation</li>
                <li>Treat our practitioners and other participants with respect</li>
                <li>Not record sessions without prior written consent</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">6. Intellectual Property</h2>
              <p className="mt-3 leading-7">
                All content on our website, including text, images, logos, and materials provided
                during our programmes, is the intellectual property of {siteConfig.name}. You may not reproduce, distribute, or create derivative
                works without our prior written consent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">7. Limitation of Liability</h2>
              <p className="mt-3 leading-7">
                To the fullest extent permitted by law, {siteConfig.name} shall not be liable
                for any indirect, incidental, special, or consequential damages arising from your
                use of our services.
              </p>
              <p className="mt-3 leading-7">
                Our total liability for any claim shall not exceed the amount paid by you for the
                specific service giving rise to the claim.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">8. Disclaimer</h2>
              <p className="mt-3 leading-7">
                Our services are for educational and supportive purposes only and do not replace
                professional medical advice. We recommend that you always consult with your
                midwife, GP, or other qualified healthcare provider regarding your pregnancy,
                birth, and postnatal care.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">9. Privacy</h2>
              <p className="mt-3 leading-7">
                Your privacy is important to us. Please review our{" "}
                <a href="/privacy" className="text-primary underline">Privacy Policy</a> to
                understand how we collect, use, and protect your personal information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">10. Changes to These Terms</h2>
              <p className="mt-3 leading-7">
                We reserve the right to modify these Terms at any time. Changes will be effective
                immediately upon posting on our website. Your continued use of our services
                constitutes acceptance of the modified Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">11. Governing Law</h2>
              <p className="mt-3 leading-7">
                These Terms are governed by and construed in accordance with the laws of England
                and Wales. Any disputes arising from these Terms shall be subject to the exclusive
                jurisdiction of the courts of England and Wales.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">12. Contact Us</h2>
              <p className="mt-3 leading-7">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="mt-3 list-none space-y-1">
                <li>Email: <a href={`mailto:${siteConfig.email}`} className="text-primary underline">{siteConfig.email}</a></li>
                <li>Phone: <a href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`} className="text-primary underline">{siteConfig.phone}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
