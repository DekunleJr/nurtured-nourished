"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

const nav = [
  { label: "Home", href: "/" },
  { label: "Maternity Packages", href: "/packages" },
  { label: "Commissioning", href: "/commissioning" },
];

const showCicLink =
  /^https:\/\//.test(siteConfig.cicUrl) && !siteConfig.cicUrl.includes("example.org");

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-cream/95 backdrop-blur">
      {/* Go Nurture Initiative CIC cross-link bar */}
      <div className="bg-primary text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm">
          <span className="font-medium">
            Part of Nurtured & Nourished — every commercial purchase funds free
            community support.
          </span>
          {showCicLink ? (
            <a
              href={siteConfig.cicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-peach"
            >
              Visit {siteConfig.cicName}
            </a>
          ) : (
            <span className="text-white/85">{siteConfig.cicName}</span>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="shrink-0" aria-label="Nurtured & Nourished home">
          <Image
            src="/Logo_horizontal.png"
            alt="Nurtured & Nourished Women's Health Ltd"
            width={220}
            height={63}
            priority
            className="h-auto w-44 sm:w-56"
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-charcoal transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/discovery"
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary"
          >
            Book a Discovery Call
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-charcoal/15 text-charcoal lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          className="border-t border-charcoal/10 bg-cream px-4 py-4 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-medium text-charcoal transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/discovery"
              onClick={() => setOpen(false)}
              className="rounded-full bg-coral px-5 py-3 text-center text-base font-semibold text-white"
            >
              Book a Discovery Call
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}