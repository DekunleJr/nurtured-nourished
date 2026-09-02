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
                {siteConfig.name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is
                committed to protecting your personal data. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our
                website or use our services.
              </p>
              <p className="mt-3 leading-7">
                We are a data controller under the UK General Data Protection Regulation (UK GDPR)
                and the Data Protection Act 2018. Our company registration number is {siteConfig.companyNumber}
                and our registered office is {siteConfig.registeredOffice}.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">2. Information We Collect</h2>
              <p className="mt-3 leading-7">We may collect the following types of personal data:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Identity Data:</strong> Name, email address, phone number</li>
                <li><strong>Contact Data:</strong> Email address, postal address</li>
                <li><strong>Health Information:</strong> Due date, postcode (for service delivery) - this is special-category data</li>
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

            <div>
              <h2 className="text-2xl font-bold text-charcoal">4. Legal Basis for Processing</h2>
              <p className="mt-3 leading-7">We process your personal data under the following legal bases:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Contract:</strong> To perform our contractual obligations to you</li>
                <li><strong>Legitimate Interest:</strong> To improve our services and communicate with you</li>
                <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing)</li>
                <li><strong>Explicit Consent:</strong> For special-category health data (due date, postcode)</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">5. Data Retention</h2>
              <p className="mt-3 leading-7">
                We retain your personal data only for as long as necessary to fulfil the purposes
                for which it was collected:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Enquiry data:</strong> 12 months from last contact</li>
                <li><strong>Client records:</strong> Duration of service delivery plus 12 months</li>
                <li><strong>Marketing consent:</strong> Until you withdraw consent</li>
                <li><strong>Website analytics:</strong> 26 months (anonymised)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">6. Your Rights</h2>
              <p className="mt-3 leading-7">Under UK GDPR, you have the right to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="mt-3 leading-7">
                To exercise any of these rights, please contact our Data Protection Officer at{" "}
                <a href={`mailto:${siteConfig.dpoEmail}`} className="text-primary underline">
                  {siteConfig.dpoEmail}
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">7. Complaints</h2>
              <p className="mt-3 leading-7">
                If you are unhappy with how we have handled your data, you have the right to
                complain to the Information Commissioner&apos;s Office (ICO) at{" "}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  ico.org.uk
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">8. Cookies</h2>
              <p className="mt-3 leading-7">
                Our website uses cookies to enhance your browsing experience. For more information
                about the cookies we use and how to manage your preferences, please see our{" "}
                <a href="/cookies" className="text-primary underline">Cookie Policy</a>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">9. Contact Us</h2>
              <p className="mt-3 leading-7">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="mt-3 list-none space-y-1">
                <li>Email: <a href={`mailto:${siteConfig.email}`} className="text-primary underline">{siteConfig.email}</a></li>
                <li>Data Protection Officer: <a href={`mailto:${siteConfig.dpoEmail}`} className="text-primary underline">{siteConfig.dpoEmail}</a></li>
                <li>Phone: <a href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`} className="text-primary underline">{siteConfig.phone}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
