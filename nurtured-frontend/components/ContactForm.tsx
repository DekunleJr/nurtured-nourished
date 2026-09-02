"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { siteConfig } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

const initial = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const labelCls = "block text-sm font-semibold text-charcoal";
const inputCls =
  "mt-1 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25";

export default function ContactForm() {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");

  function update(key: keyof typeof initial) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setValues(initial);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border-2 border-primary bg-primary-soft p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-5 text-2xl font-bold text-charcoal">Message sent!</h3>
        <p className="mx-auto mt-3 max-w-md text-charcoal/70">
          Thank you for getting in touch. We&apos;ll respond to{" "}
          <span className="font-semibold text-primary">{values.email}</span> within two working days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-bold text-charcoal">Send us a message</h3>
      <p className="mt-1 text-sm text-charcoal/60">
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            className={inputCls}
            required
            placeholder="Full name"
            value={values.name}
            onChange={update("name")}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="contact-email">Email address</label>
          <input
            id="contact-email"
            type="email"
            className={inputCls}
            required
            placeholder="you@example.com"
            value={values.email}
            onChange={update("email")}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="contact-subject">Subject</label>
          <input
            id="contact-subject"
            className={inputCls}
            required
            placeholder="How can we help?"
            value={values.subject}
            onChange={update("subject")}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            rows={5}
            className={inputCls}
            required
            placeholder="Tell us what you need..."
            value={values.message}
            onChange={update("message")}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-charcoal">
          Something went wrong sending your message. Please try again, or email us directly at{" "}
          <a className="font-semibold text-primary underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
      <p className="mt-3 text-center text-xs text-charcoal/50">
        We&apos;ll only use your details to respond to your enquiry.
      </p>
    </form>
  );
}
