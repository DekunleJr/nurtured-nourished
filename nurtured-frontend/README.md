# Nurtured & Nourished — Frontend (Site 1)

The commercial parent site for **Nurtured & Nourished Women's Health Ltd**,
built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and TypeScript.

## Pages

- `/` — Home (hero, values, package preview, women's journey, dual CTA)
- `/packages` — B2C maternity packages with a side-by-side comparison
  (middle column is the highlighted *Flagship Programme*)
- `/commissioning` — B2B commissioning page with inquiry form and five-year roadmap
- `/discovery` — forced intake form, then a Calendly booking widget

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
