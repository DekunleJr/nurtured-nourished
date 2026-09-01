/**
 * Central site configuration for the Nurtured & Nourished commercial site.
 *
 * Everything the client needs is read from NEXT_PUBLIC_* environment variables
 * so the site can be configured (domain, Calendly link, Site 2 CIC link) without
 * touching code. Copy `.env.example` to `.env.local` and fill in your values.
 */
export const siteConfig = {
  name: "Nurtured & Nourished Women's Health Ltd",
  shortName: "Nurtured & Nourished",
  tagline: "Empowering women through every stage of life",
  description:
    "Expert-led perinatal education, birth preparation, postnatal support and infant feeding support for parents across the UK.",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@nurturedandnourished.co.uk",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+44 (0) 1603 000 000",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurturedandnourished.co.uk",
  /**
   * The Go Nurture Initiative CIC subsidiary site (Site 2).
   * Fill NEXT_PUBLIC_CIC_URL with the real Site 2 URL. While unset the UI hides
   * the external link and shows the name only.
   */
  cicName: process.env.NEXT_PUBLIC_CIC_NAME ?? "Go Nurture Initiative CIC",
  cicUrl: process.env.NEXT_PUBLIC_CIC_URL ?? "https://go-nurture.example.org",
  /**
   * Public Calendly scheduling link.
   * Fill NEXT_PUBLIC_CALENDLY_URL with your real event URL, e.g.
   * https://calendly.com/your-account/15-minute-discovery-call
   * The placeholder below intentionally does NOT load the widget.
   */
  calendlyUrl:
    process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/your-account/15-minute-discovery-call",
  /** FastAPI backend base URL (used server-side by API route handlers). */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
} as const;

/** True once a real Calendly event URL has been configured. */
export const hasRealCalendlyUrl = /^https:\/\/calendly\.com\//.test(
  siteConfig.calendlyUrl
) && !/your-account|example\.org|REPLACE|CHANGE_ME/i.test(siteConfig.calendlyUrl);