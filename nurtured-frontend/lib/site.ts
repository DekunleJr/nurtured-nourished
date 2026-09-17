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
  tagline: "Supporting women through every stage of life",
  description:
    "Premium, evidence-informed perinatal education, birth preparation and infant-feeding support — delivered live online with professional expertise, personal attention and meaningful partner involvement.",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@nurturedandnourished.co.uk",
  /**
   * Telephone is intentionally unset until a real, monitored business line is
   * confirmed. Leave NEXT_PUBLIC_PHONE empty and the phone block is hidden
   * everywhere rather than showing a placeholder number.
   */
  phone: process.env.NEXT_PUBLIC_PHONE ?? "",
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
  /**
   * Company registration details. Left empty until incorporation is complete so
   * no placeholder statutory information is published on the live site.
   */
  companyNumber: process.env.NEXT_PUBLIC_COMPANY_NUMBER ?? "",
  registeredOffice: process.env.NEXT_PUBLIC_REGISTERED_OFFICE ?? "",
  dpoEmail: process.env.NEXT_PUBLIC_DPO_EMAIL ?? "dpo@nurturedandnourished.co.uk",
  reviewDate: process.env.NEXT_PUBLIC_REVIEW_DATE ?? "January 2027",
} as const;

/** True once a real telephone number has been configured. */
export const hasPhone = siteConfig.phone.trim().length > 0;

/** True once statutory company details have been confirmed and added. */
export const hasCompanyDetails =
  siteConfig.companyNumber.trim().length > 0 &&
  siteConfig.registeredOffice.trim().length > 0;

/** True once a real Calendly event URL has been configured. */
export const hasRealCalendlyUrl = /^https:\/\/calendly\.com\//.test(
  siteConfig.calendlyUrl
) && !/your-account|example\.org|REPLACE|CHANGE_ME/i.test(siteConfig.calendlyUrl);