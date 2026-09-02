import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description: "How Nurtured & Nourished collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h1 className="font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            Privacy Policy
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
                Nurtured & Nourished Women&apos;s Health Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is
                committed to protecting your personal data. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our
                website or use our services.
              </p>
              <p className="mt-3 leading-7">
                We are a data controller under the UK General Data Protection Regulation (UK GDPR)
                and the Data Protection Act 2018.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">2. Information We Collect</h2>
              <p className="mt-3 leading-7">We may collect the following types of personal data:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Identity Data:</strong> Name, email address, phone number</li>
                <li><strong>Contact Data:</strong> Email address, postal address</li>
                <li><strong>Health Information:</strong> Due date, postcode (for service delivery)</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Data:</strong> How you use our website and services</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">3. How We Use Your Information</h2>
              <p className="mt-3 leading-7">We use your personal data for:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>To respond to your enquiries and provide our services</li>
                <li>To book and manage discovery calls and consultations</li>
                <li>To deliver our perinatal education programmes</li>
                <li>To send you service-related communications</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
