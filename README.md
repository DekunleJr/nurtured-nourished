# nurtured-nourished

Website for **Nurtured & Nourished Women's Health Ltd** — a hybrid commercial and
social impact business. This repository currently contains the **commercial parent
site (Site 1)** built on Next.js, with a FastAPI backend.

The social impact arm (**Go Nurture Initiative CIC**, Site 2) already exists and is
linked to from Site 1 via `NEXT_PUBLIC_CIC_URL`.

## Structure

```
nurtured-frontend/  Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript
nurtured-backend/   FastAPI + SQLAlchemy 2 + Postgres (schema: nurture)
```

## Pages (Site 1)

| Route            | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `/`              | Home — hero, values, packages preview, women's journey          |
| `/packages`      | B2C packages — 3-column comparison (flagship middle column)    |
| `/commissioning` | B2B — inquiry form + five-year roadmap                          |
| `/discovery`     | Discovery call — forced intake form → Calendly scheduler       |

## Environment variables

### Frontend (`nurtured-frontend/.env.local`)

Copy `nurtured-frontend/.env.example` to `nurtured-frontend/.env.local` and fill in:

| Variable                   | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_CALENDLY_URL` | Your live Calendly event URL (blank until configured)           |
| `NEXT_PUBLIC_CIC_URL`      | Live Site 2 (Go Nurture Initiative) URL — set later             |
| `NEXT_PUBLIC_CIC_NAME`     | Site 2 display name                                              |
| `NEXT_PUBLIC_API_URL`      | FastAPI backend base URL (default `http://127.0.0.1:8000`)      |
| `NEXT_PUBLIC_SITE_URL`     | Public site URL for SEO metadata                                 |
| `NEXT_PUBLIC_SUPPORT_EMAIL`/`NEXT_PUBLIC_PHONE` | Contact details                             |

### Backend (`nurtured-backend/.env`)

| Variable          | Purpose                                                          |
| ----------------- | --------------------------------------------------------------- |
| `DATABASE_URL`    | Postgres DSN. The `?schema=nurture` query param pins the schema; tables are created inside `nurture`. |
| `CORS_ORIGINS`    | Comma-separated allow-list (default `http://localhost:3000`)     |
| `ENV`             | `development` / `production`                                     |

## Running locally

```bash
# Backend (from nurtured-backend, using the bundled venv)
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload

# Frontend (from nurtured-frontend)
npm install
npm run dev
```

Open http://localhost:3000 — the site links to the backend on port 8000.