"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { hasRealCalendlyUrl, siteConfig } from "@/lib/site";
import { packages } from "@/lib/packages";

const initial = { name: "", email: "", due_date: "", postcode: "", package: "" };
type Status = "idle" | "submitting" | "error";

const labelCls = "block text-sm font-semibold text-charcoal";
const inputCls =
  "mt-1 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25";

export default function DiscoveryBooking({ presetSlug }: { presetSlug: string | null }) {
  const preset = packages.find((p) => p.slug === presetSlug);
  const [values, setValues] = useState({
    ...initial,
    package: preset ? preset.name : initial.package,
  });
  const [status, setStatus] = useState<Status>("idle");
  const [unlocked, setUnlocked] = useState(false);
  const [widgetFailed, setWidgetFailed] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  function update(key: keyof typeof initial) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  async function submitIntake(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/discovery-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Intake failed");
      setStatus("idle");
      revealCalendar();
    } catch {
      setStatus("error");
    }
  }

  function revealCalendar() {
    setUnlocked(true);
    requestAnimationFrame(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    if (!unlocked || !hasRealCalendlyUrl || !widgetRef.current) return;
    const win = window as unknown as { Calendly?: { initInlineWidget: (o: object) => void } };
    const init = () => {
      if (!widgetRef.current) return;
      try {
        win.Calendly?.initInlineWidget({
          url: siteConfig.calendlyUrl,
          parentElement: widgetRef.current,
          prefill: {
            name: values.name,
            email: values.email,
          },
        });
        setWidgetFailed(false);
      } catch {
        setWidgetFailed(true);
      }
    };
    if (win.Calendly) {
      init();
      return;
    }
    const id = "calendly-widget-js";
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.id = id;
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
    script.onload = init;
    script.onerror = () => setWidgetFailed(true);
  }, [unlocked]);

  return (
    <>
      <section className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-charcoal">
          {unlocked ? "Nearly there \u2014 pick your time" : "Tell us a little about you"}
        </h2>
        <p className="mt-2 text-charcoal/65">
          {unlocked
            ? "Choose a slot that suits you below. You and your birthing partner are both welcome."
            : "Fill in your details below and we will reveal the booking calendar for you."}
        </p>

        {!unlocked && (
          <form onSubmit={submitIntake} className="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="dc-name">Your name</label>
              <input id="dc-name" className={inputCls} required placeholder="Full name" value={values.name} onChange={update("name")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="dc-email">Email address</label>
              <input id="dc-email" type="email" className={inputCls} required placeholder="you@example.com" value={values.email} onChange={update("email")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="dc-dueDate">Due date</label>
              <input id="dc-dueDate" type="date" className={inputCls} required value={values.due_date} onChange={update("due_date")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="dc-postcode">Postcode</label>
              <input id="dc-postcode" className={inputCls} required placeholder="e.g. NR1 1AA" value={values.postcode} onChange={update("postcode")} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls} htmlFor="dc-package">Which package are you most interested in?</label>
              <select id="dc-package" className={inputCls} required value={values.package} onChange={update("package")}>
                <option value="" disabled>Select a package\u2026</option>
                {packages.map((p) => (
                  <option key={p.slug} value={p.name}>{p.name} \u2014 {p.price}</option>
                ))}
                <option value="not-sure">I&amp;apos;m not sure yet</option>
              </select>
            </div>

            {status === "error" && (
              <div className="md:col-span-2 rounded-xl bg-coral/10 px-4 py-3 text-sm text-charcoal">
                We couldn&amp;apos;t save your details just now \u2014 please try again, or
                continue to booking and we&amp;apos;ll catch up on your call.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-full bg-coral px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Saving\u2026" : "Continue to booking"}
              </button>
              {status === "error" && (
                <button
                  type="button"
                  onClick={revealCalendar}
                  className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
                >
                  Continue anyway
                </button>
              )}
            </div>
          </form>
        )}

        {unlocked && (
          <div className="mt-8">
            {hasRealCalendlyUrl ? (
              <>
                <div ref={calendarRef} className="scroll-mt-32" />
                <div ref={widgetRef} className="h-[720px] overflow-hidden rounded-2xl border border-charcoal/10" />
                {widgetFailed && (
                  <div className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-charcoal">
                    The calendar couldn&amp;apos;t load. You can still book by emailing{" "}
                    <a className="font-semibold text-primary underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                  </div>
                )}
              </>
            ) : (
              <div ref={calendarRef} className="scroll-mt-32 rounded-2xl bg-primary-soft p-8 text-center">
                <h3 className="text-xl font-bold text-charcoal">Booking calendar coming soon</h3>
                <p className="mx-auto mt-2 max-w-md text-charcoal/70">
                  We&amp;apos;re finalising our scheduling calendar. In the meantime, email{" "}
                  <a className="font-semibold text-primary underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>{" "}
                  and we&amp;apos;ll arrange your free 15-minute discovery call.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
