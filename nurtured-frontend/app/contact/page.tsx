import { siteConfig } from "@/lib/site";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact Us", description: "Get in touch with the Nurtured & Nourished team." };

export default function ContactPage() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-serif text-4xl font-semibold text-charcoal md:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg text-charcoal/70">We'd love to hear from you. Get in touch using any of the methods below.</p>
        </div>
      </section>
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-charcoal">Get in Touch</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">Email</h3>
                    <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline">{siteConfig.email}</a>
                    <p className="mt-1 text-sm text-charcoal/60">We aim to respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">Phone</h3>
                    <a href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`} className="text-primary hover:underline">{siteConfig.phone}</a>
                    <p className="mt-1 text-sm text-charcoal/60">Monday - Friday, 9am - 5pm</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">Office Hours</h3>
                    <p className="text-charcoal/70">Monday - Friday: 9am - 5pm</p>
                    <p className="text-sm text-charcoal/60">Weekend sessions available for booked programmes</p>
                  </div>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">Not sure where to start?</h2>
          <p className="mt-3 text-charcoal/70">Book a free discovery call and we'll guide you to the right support.</p>
          <Link href="/discovery" className="mt-6 inline-block rounded-full bg-coral px-8 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary">Book your discovery call</Link>
        </div>
      </section>
    </>
  );
}
