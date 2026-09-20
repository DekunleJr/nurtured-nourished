"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { fetchSession, logout, Session } from "@/lib/auth";
const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programmes", href: "/packages" },
  { label: "Commissioning", href: "/commissioning" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Testimonials", href: "/testimonials" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);

    // Resolve the session client-side. Guarded by `mounted` so the very first
  // render matches the server render (no SSR/hydration mismatch). The
  // `setTimeout` defers the state updates out of the synchronous effect body
  // (see react-hooks/set-state-in-effect) — mirrors the AdminHeader pattern.
  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      fetchSession().then(setSession);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const handleSignOut = async () => {
    await logout();
    setSession(null);
    router.replace("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-charcoal/5 bg-cream/85 shadow-[0_10px_30px_-18px_rgb(58_58_58/0.25)] backdrop-blur-xl saturate-150 ">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-4 ">
        <Link href="/" className="shrink-0" aria-label="Nurtured & Nourished home">
          <Image
            src="/Logo_horizontal.png"
            alt="Nurtured & Nourished Women's Health Ltd"
            width={220}
            height={63}
            priority
            className="h-auto w-[352px] sm:w-[448px]"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`link-underline text-sm font-medium tracking-[0.06em] transition-colors ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-charcoal hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/discovery"
            aria-current={pathname.startsWith("/discovery") ? "page" : undefined}
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_14px_30px_-14px_rgb(240_130_129/0.6)]"
          >
            Book a Discovery Call
          </Link>
          {mounted && (session ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_14px_30px_-14px_rgb(220_38_38/0.5)]"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_14px_30px_-14px_rgb(26_150_143/0.6)]"
            >
              Log in
            </Link>
          ))}
          
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
          className="mx-4 mb-4 rounded-2xl border border-charcoal/10 bg-white px-4 py-4 shadow-lg animate-slide-down lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex min-h-[48px] items-center rounded-xl px-3 py-2.5 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary-soft text-primary"
                    : "text-charcoal hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
              
            ))}
            <Link
              href="/discovery"
              onClick={() => setOpen(false)}
              aria-current={pathname.startsWith("/discovery") ? "page" : undefined}
              className="mt-2 flex min-h-[52px] items-center justify-center rounded-full bg-coral px-5 py-3 text-center text-base font-semibold text-white"
            >
              Book a Discovery Call
            </Link>
            {mounted && (session ? (
              <button
                type="button"
                onClick={() => {
                  handleSignOut();
                  setOpen(false);
                }}
                className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-red-600 px-5 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-red-700"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-center text-base font-semibold text-white"
              >
                Log in
              </Link>
            ))}
            
          </div>
        </nav>
      )}
    </header>
  );
}