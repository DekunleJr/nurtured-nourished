"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";

export default function CookiesContent() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    setConsent(localStorage.getItem("cookie_consent"));
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie_consent", "accepted");
    setConsent("accepted");
  }

  function handleReject() {
    localStorage.setItem("cookie_consent", "rejected");
    setConsent("rejected");
  }

  return (
    <>
      <section className="bg-primary-soft/60">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h1 className="font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            Cookie Policy
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
              <h2 className="text-2xl font-bold text-charcoal">1. What Are Cookies?</h2>
              <p className="mt-3 leading-7">
                Cookies are small text files placed on your device when you visit a website.
                They help websites work more efficiently and provide information to site owners.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">2. Cookies We Use</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[500px] rounded-2xl border border-charcoal/10 bg-white text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-charcoal/10 bg-cream p-3 font-bold">Cookie</th>
                      <th className="border-b border-charcoal/10 bg-cream p-3 font-bold">Purpose</th>
                      <th className="border-b border-charcoal/10 bg-cream p-3 font-bold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-charcoal/5 p-3 font-medium">cookie_consent</td>
                      <td className="border-b border-charcoal/5 p-3">Stores your cookie preference</td>
                      <td className="border-b border-charcoal/5 p-3">12 months</td>
                    </tr>
                    <tr>
                      <td className="border-b border-charcoal/5 p-3 font-medium">_ga</td>
                      <td className="border-b border-charcoal/5 p-3">Google Analytics - distinguishes users</td>
                      <td className="border-b border-charcoal/5 p-3">2 years</td>
                    </tr>
                    <tr>
                      <td className="border-b border-charcoal/5 p-3 font-medium">_gid</td>
                      <td className="border-b border-charcoal/5 p-3">Google Analytics - distinguishes users</td>
                      <td className="border-b border-charcoal/5 p-3">24 hours</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">_gat</td>
                      <td className="p-3">Google Analytics - throttles request rate</td>
                      <td className="p-3">1 minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">3. Essential Cookies</h2>
              <p className="mt-3 leading-7">
                Some cookies are essential for our website to function properly. These include
                cookies that store your cookie consent preferences. These cookies do not require
                your consent under UK law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">4. Analytics Cookies</h2>
              <p className="mt-3 leading-7">
                We use Google Analytics to help us understand how visitors use our website.
                These cookies collect information anonymously and generate reports on website
                usage. You can opt out of analytics cookies using the controls below.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">5. Managing Cookies</h2>
              <p className="mt-3 leading-7">
                You can control and delete cookies through your browser settings:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
              <p className="mt-3 leading-7">
                Disabling cookies may affect website functionality.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">6. Your Preference</h2>
              <p className="mt-3 leading-7">
                Current status: <strong>{consent === "accepted" ? "Accepted" : consent === "rejected" ? "Rejected" : "Not set"}</strong>
              </p>
              <div className="mt-4 flex gap-3">
                <button onClick={handleAccept} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
                  Accept
                </button>
                <button onClick={handleReject} className="rounded-full border-2 border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal hover:bg-charcoal/5">
                  Reject
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal">7. Contact Us</h2>
              <p className="mt-3 leading-7">
                Email: <a href={`mailto:${siteConfig.email}`} className="text-primary underline">{siteConfig.email}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}