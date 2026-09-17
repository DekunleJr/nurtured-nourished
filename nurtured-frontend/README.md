# Nurtured & Nourished — Frontend (Site 1)

The commercial parent site for **Nurtured & Nourished Women's Health Ltd**,
built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and TypeScript.

## Pages

- `/` — Home (hero, programme preview, FOBCP pillars, vision, dual CTA)
- `/packages` — the long-form **Perinatal Programmes** page. Covers the FOBCP™
  explainer (`#fobcp`), the six-week journey (`#journey`), the FOBCP approach
  (`#approach`) and VOICE™ decision framework (`#voice`), cohort size, programme
  materials and WhatsApp Programme Support, the three Maternal options
  (`#foundation` £295 / `#continuity` £345 / `#extended` £395), payment options
  (`#payment`), the £60 additional postnatal session, the Postnatal Reunion,
  the entry window (`#cohorts`), Meet Favour, the scope-of-practice disclaimer
  and the closing CTA. Fees, tier copy and shared programme facts all live in
  `lib/packages.ts` so the homepage preview and the discovery-call dropdown stay
  in sync.
- `/commissioning` — commissioning/B2B page with an inquiry form and an intended
  five-year pathway (clearly labelled as future intent, not current services)
- `/discovery` — intake form, then a Calendly booking widget (falls back to an
  email prompt while `NEXT_PUBLIC_CALENDLY_URL` is unset)

## Environment setup

Copy `.env.example` to `.env.local` and fill in your values.

| Variable                   | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_CALENDLY_URL` | Live Calendly event URL — the booking scheduler  |
| `NEXT_PUBLIC_CIC_URL`      | Site 2 (Go Nurture Initiative CIC) URL           |
| `NEXT_PUBLIC_CIC_NAME`     | Site 2 display name                              |
| `NEXT_PUBLIC_API_URL`      | FastAPI backend base URL                         |
| `NEXT_PUBLIC_SITE_URL`     | Public site URL (SEO metadata)                   |
| `NEXT_PUBLIC_SUPPORT_EMAIL`/`NEXT_PUBLIC_PHONE` | Contact details                    |

> The Calendly and CIC URLs are intentionally blank until configured — the UI
> shows a friendly "calendar coming soon" / name-only CIC link in the meantime.
>
> `NEXT_PUBLIC_COMPANY_NUMBER`, `NEXT_PUBLIC_REGISTERED_OFFICE` and
> `NEXT_PUBLIC_PHONE` are likewise blank by default. While unset, the statutory
> blocks on `/privacy` and `/terms` fall back to routing queries to
> `NEXT_PUBLIC_SUPPORT_EMAIL`, and every phone/telephone element (contact page,
> footer, JSON-LD) is hidden — no placeholder company number or phone number is
> ever published.

## Running

```bash
npm install
npm run dev
```

Open http://localhost:3000. The API route handlers (`/api/discovery-intake`,
`/api/leads`) proxy to the FastAPI backend on `NEXT_PUBLIC_API_URL` (default
`http://127.0.0.1:8000`).

## Build & validation

```bash
npm run build
npm run lint
```
