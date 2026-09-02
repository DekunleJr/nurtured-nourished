import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { packages } from "@/lib/packages";

const showCicLink =
  /^https:\/\//.test(siteConfig.cicUrl) && !siteConfig.cicUrl.includes("example.org");

const socialLinks = [
  { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#" },
  { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "#" },
  { label: "LinkedIn", href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "#" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Image
            src="/Logo_horizontal.png"
            alt="Nurtured & Nourished Women's Health Ltd"
            width={200}
            height={57}
            className="h-auto w-40 brightness-0 invert"
          />
          <p className="text-sm leading-6 text-white/70">
            Expert-led perinatal education, birth preparation, postnatal support
            and infant feeding support for parents across the UK.
          </p>
          <div className="flex gap-3 pt-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary"
              >
                {social.label === "Instagram" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                )}
                {social.label === "Facebook" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                )}
                {social.label === "LinkedIn" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="transition-colors hover:text-peach">Home</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-peach">About Us</Link></li>
            <li><Link href="/packages" className="transition-colors hover:text-peach">Maternity Packages</Link></li>
            <li><Link href="/commissioning" className="transition-colors hover:text-peach">Commissioning & B2B</Link></li>
            <li><Link href="/testimonials" className="transition-colors hover:text-peach">Testimonials</Link></li>
            <li><Link href="/faq" className="transition-colors hover:text-peach">FAQ</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-peach">Contact</Link></li>
            <li><Link href="/discovery" className="transition-colors hover:text-peach">Book a Discovery Call</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            Programmes
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {packages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/packages#${p.slug}`}
                  className="transition-colors hover:text-peach"
                >
                  {p.name} — {p.price}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition-colors hover:text-peach"
              >
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                className="transition-colors hover:text-peach"
              >
                {siteConfig.phone}
              </a>
            </li>
          </ul>
          {showCicLink ? (
            <a
              href={siteConfig.cicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary-soft/40 px-4 py-2 text-xs font-medium text-primary-soft transition-colors hover:border-peach hover:text-peach"
            >
              {siteConfig.cicName} ↗
            </a>
          ) : (
            <p className="mt-5 max-w-[220px] text-xs leading-5 text-white/50">
              {siteConfig.cicName} — our community impact arm.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white">Cookie Policy</Link>
          </div>
          <p className="text-center">
            We provide education, support, preparation, coaching and workshops — not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}