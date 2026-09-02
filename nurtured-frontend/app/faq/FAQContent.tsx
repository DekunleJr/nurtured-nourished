"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    category: "Programmes",
    questions: [
      { q: "What format do your programmes take?", a: "Our programmes are delivered live online via Zoom, allowing you to join from anywhere in the UK. Group programmes are kept small (typically 6-10 participants) to ensure everyone receives personal attention." },
      { q: "When should I start a programme?", a: "We recommend starting our birth preparation programmes around 28-32 weeks of pregnancy, but you can join at any stage. Postnatal support can begin from birth onwards." },
      { q: "Can my birthing partner attend?", a: "Absolutely! Birthing partners are welcome throughout all programmes. We also offer dedicated partner sessions to ensure they feel confident and prepared." },
      { q: "What if I miss a session?", a: "We understand that life happens! While we encourage attendance at every session, we can provide catch-up resources. One-to-one sessions can be rescheduled with 24 hours notice." },
    ],
  },
  {
    category: "Booking & Payment",
    questions: [
      { q: "How do I book a programme?", a: "Start by booking a free 15-minute discovery call. We'll discuss your needs and recommend the best package for you." },
      { q: "What payment methods do you accept?", a: "We accept all major debit and credit cards, bank transfers, and can invoice organisations for commissioned programmes." },
      { q: "Is there a cancellation policy?", a: "Yes. Cancellations 14+ days before the programme start receive a full refund. 7-13 days: 50% refund. Less than 7 days: non-refundable but transferable." },
      { q: "Can I pay in instalments?", a: "Yes, we offer instalment plans for our packages. Please discuss this during your discovery call." },
    ],
  },
  {
    category: "Support",
    questions: [
      { q: "What kind of postnatal support do you offer?", a: "Our postnatal support includes infant feeding guidance, emotional wellbeing check-ins, and practical newborn care advice." },
      { q: "Do you offer one-to-one support?", a: "Yes, our Maternal Premium package includes individualised one-to-one birth preparation. Additional sessions can be added to any package." },
      { q: "Is your service available across the UK?", a: "Yes! Our online programmes are available to families anywhere in the UK. We also offer commissioned services nationwide." },
      { q: "What qualifications do your practitioners have?", a: "Our team includes qualified perinatal practitioners, infant feeding specialists, and birth educators with relevant professional qualifications." },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-charcoal/10">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={open}>
        <span className="font-semibold text-charcoal">{question}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="pb-5"><p className="leading-7 text-charcoal/70">{answer}</p></div>}
    </div>
  );
}

export default function FAQContent() {
  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-serif text-4xl font-semibold text-charcoal md:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-charcoal/70">Everything you need to know about our programmes and services.</p>
        </div>
      </section>
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-16">
          {faqs.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="mb-4 text-xl font-bold text-primary">{category.category}</h2>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                {category.questions.map((faq) => (<FAQItem key={faq.q} question={faq.q} answer={faq.a} />))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">Still have questions?</h2>
          <p className="mt-3 text-charcoal/70">We're here to help. Book a free discovery call or send us a message.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/discovery" className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary">Book a call</Link>
            <Link href="/contact" className="rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
