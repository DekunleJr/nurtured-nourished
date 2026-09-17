"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    category: "Programmes",
    questions: [
      { q: "What format do your programmes take?", a: "Programmes are delivered live online, so you can join from anywhere in the UK. Every FOBCP™ cohort is limited to five women, with each participant welcome to bring a birth partner or chosen supporter." },
      { q: "When should I start a programme?", a: "The standard FOBCP™ entry window is designed around beginning Week 1 between approximately 24 and 32+6 weeks of pregnancy. If you are earlier or later than that, it does not automatically mean the programme isn't suitable for you — we may simply need to discuss which cohort or route best fits your timing." },
      { q: "Can my birthing partner attend?", a: "Yes. Birth partners and chosen supporters are welcome throughout the programme and are encouraged to prepare for their role during labour, birth and the transition into early parenthood. Having one is never a condition of taking part." },
      { q: "What if I miss a session?", a: "We understand that life happens! While we encourage attendance at every session, we can provide catch-up resources. One-to-one sessions can be rescheduled with 24 hours notice." },
    ],
  },
  {
    category: "Booking & Payment",
    questions: [
      { q: "How do I book a programme?", a: "Start by booking a complimentary 15-minute discovery call. We will talk through your needs and recommend the option that fits best." },
      { q: "What payment methods do you accept?", a: "We accept all major debit and credit cards, bank transfers, and can invoice organisations for commissioned programmes." },
      { q: "Is there a cancellation policy?", a: "Yes. Cancellations 14+ days before the programme start receive a full refund. 7-13 days: 50% refund. Less than 7 days: non-refundable but transferable." },
      { q: "Can I pay in instalments?", a: "Yes, where your booking date allows. Booking 8 or more weeks before your programme begins, you can pay in full or in up to 3 interest-free payments; 4–8 weeks before, in up to 2 payments; and less than 4 weeks before, payment is in full. Your first payment is taken when you book, and the full programme fee is due before Week 1." },
    ],
  },
  {
    category: "Support",
    questions: [
      { q: "What kind of postnatal support do you offer?", a: "Every Maternal option includes the same complete six-week FOBCP™ programme, followed by private one-to-one postnatal support sessions. How many sessions you receive, and the window in which they can be used, depends on the option you choose: one session within your first 6 weeks after birth, two across your first 12 weeks, or three across your first 6 months." },
      { q: "Do you offer one-to-one support?", a: "Yes. Private postnatal support sessions are included in every Maternal option, and existing Maternal clients can book an additional 45-minute postnatal support session, subject to availability." },
      { q: "Is your service available across the UK?", a: "Yes — programmes are delivered live online to families anywhere in the UK. We also offer commissioned services nationwide." },
      { q: "What qualifications do your practitioners have?", a: "Your programmes are taught by Favour Oloye, a Registered Nurse and Antenatal Educator. Where your programme includes specialist infant-feeding support, it is provided by an appropriately qualified specialist colleague, whose specific credentials are confirmed in writing before your programme begins." },
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
          <p className="mt-3 text-charcoal/70">We&apos;re here to help. Book a complimentary discovery call or send us a message.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/discovery" className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary">Book a discovery call</Link>
            <Link href="/contact" className="rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
