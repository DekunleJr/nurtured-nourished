"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const initial = {
  organisation: "",
  contactName: "",
  jobTitle: "",
  email: "",
  goals: "",
};

const labelCls = "block text-sm font-semibold text-charcoal";
const inputCls =
  "mt-1 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25";

export default function CommissioningForm() {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");

  function update(key: keyof typeof initial) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
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
        <h3 className="mt-5 text-2xl font-bold text-charcoal">Thank you — inquiry received</h3>
        <p className="mx-auto mt-3 max-w-md text-charcoal/70">
          Our commissioning team will be in touch at{" "}
          <span className="font-semibold text-primary">{values.email}</span> within
          two working days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-bold text-charcoal">Commissioning inquiry</h3>
      <p className="mt-1 text-sm text-charcoal/60">
        Tell us about your organisation and what you’d like to achieve.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="organisation">Organisation name</label>
          <input
            id="organisation"
            className={inputCls}
            required
            placeholder="e.g. An NHS Trust, Integrated Care Board…"
            value={values.organisation}
            onChange={update("organisation")}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="contactName">Your name</label>
          <input
            id="contactName"
            className={inputCls}
            required
            placeholder="Full name"
            value={values.contactName}
            onChange={update("contactName")}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="jobTitle">Job title</label>
          <input
            id="jobTitle"
            className={inputCls}
            required
            placeholder="e.g. Head of Maternity Services"
            value={values.jobTitle}
            onChange={update("jobTitle")}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="email">Business email</label>
          <input
            id="email"
            type="email"
            className={inputCls}
            required
            placeholder="you@organisation.org.uk"
            value={values.email}
            onChange={update("email")}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="goals">What are you hoping to achieve?</label>
          <textarea
            id="goals"
            rows={4}
            className={inputCls}
            placeholder="Tell us about your staff wellbeing goals, cohort ambitions or commissioning priorities…"
            value={values.goals}
            onChange={update("goals")}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-charcoal">
          Something went wrong sending your inquiry. Please try again, or email us
          directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send inquiry"}
      </button>
      <p className="mt-3 text-center text-xs text-charcoal/50">
        We’ll only use your details to respond to your inquiry.
      </p>
    </form>
  );
}