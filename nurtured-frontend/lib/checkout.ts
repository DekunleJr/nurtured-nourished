'use client';

/**
 * Client-side helpers for the customer checkout flow.
 *
 * All calls go through the same-origin /api/me proxy, so the session cookie
 * flows automatically and the browser never talks to the FastAPI backend
 * directly. Types mirror app/routers/checkout.py on the backend.
 */

export interface PlanOption {
  code: string;
  label: string;
  instalments: number;
  amounts_pence: number[];
  summary: string;
}

export interface EligibleCohort {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
  duration_weeks: number;
  session_time: string;
  seats_left: number;
  days_to_start: number;
  weeks_to_start: number;
  category: 'A' | 'B' | 'C';
  plans: PlanOption[];
}

export interface CohortsResponse {
  due_date: string;
  package: {
    id: number;
    slug: string;
    name: string;
    price_pence: number;
    currency: string;
    price_note: string;
  };
  items: EligibleCohort[];
}

export interface Instalment {
  sequence: number;
  amount_pence: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'void';
  paid_at: string | null;
}

export interface BookingDetail {
  reference: string;
  status: string;
  payment_plan: string;
  instalments_total: number;
  amount_paid_pence: number;
  package_name: string;
  package_price_pence: number;
  package_currency: string;
  cohort: {
    id: number;
    label: string;
    start_date: string;
    end_date: string;
    session_time: string;
  } | null;
  instalments: Instalment[];
  next_instalment: Instalment | null;
  payment_enabled: boolean;
  created_at: string | null;
}

export interface PackageSummary {
  id: number;
  slug: string;
  name: string;
  price_pence: number;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function detailOf(body: Record<string, unknown>, fallback: string): string {
  const d = body.detail;
  return typeof d === 'string' && d ? d : fallback;
}

/** The published package matching a slug (id needed by the cohorts endpoint). */
export async function fetchPackages(): Promise<PackageSummary[]> {
  const response = await fetch('/api/packages', { cache: 'no-store' });
  if (!response.ok) return [];
  const body = await readJson(response);
  const items = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body)
      ? body
      : [];
  return (items as Record<string, unknown>[])
    .filter((p) => typeof p.id === 'number' && typeof p.slug === 'string')
    .map((p) => ({
      id: p.id as number,
      slug: p.slug as string,
      name: String(p.name ?? ''),
      price_pence: Number(p.price_pence ?? 0),
    }));
}

/** Cohorts that finish before the signed-in customer's due date, with plans. */
export async function fetchEligibleCohorts(
  packageId: number,
): Promise<{ ok: boolean; data?: CohortsResponse; message?: string }> {
  const response = await fetch(`/api/me/cohorts?package_id=${packageId}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const body = await readJson(response);
  if (response.ok) {
    return { ok: true, data: body as unknown as CohortsResponse };
  }
  return { ok: false, message: detailOf(body, 'Could not load cohorts') };
}

/** Reserve the place and create the instalment schedule. */
export async function createCheckout(
  packageId: number,
  cohortId: number,
  planCode: string,
): Promise<{
  ok: boolean;
  data?: BookingDetail & { checkout_url: string | null };
  message?: string;
}> {
  const response = await fetch('/api/me/checkout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      package_id: packageId,
      cohort_id: cohortId,
      plan_code: planCode,
    }),
  });
  const body = await readJson(response);
  if (response.ok) {
    return {
      ok: true,
      data: body as unknown as BookingDetail & { checkout_url: string | null },
    };
  }
  return { ok: false, message: detailOf(body, 'Checkout failed') };
}

/** The signed-in customer's purchases, newest first. */
export async function fetchMyBookings(): Promise<BookingDetail[]> {
  const response = await fetch('/api/me/bookings', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const body = await readJson(response);
  return (Array.isArray(body.items) ? body.items : []) as unknown as BookingDetail[];
}

/** One purchase with its schedule. */
export async function fetchBooking(
  reference: string,
): Promise<BookingDetail | null> {
  const response = await fetch(
    `/api/me/bookings/${encodeURIComponent(reference)}`,
    { credentials: 'include', cache: 'no-store' },
  );
  if (!response.ok) return null;
  return (await readJson(response)) as unknown as BookingDetail;
}

/** Stripe Checkout URL for a specific outstanding instalment. */
export async function payInstalment(
  reference: string,
  sequence: number,
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const response = await fetch(
    `/api/me/bookings/${encodeURIComponent(reference)}/instalments/${sequence}/pay`,
    { method: 'POST', credentials: 'include' },
  );
  const body = await readJson(response);
  if (response.ok && typeof body.checkout_url === 'string') {
    return { ok: true, url: body.checkout_url };
  }
  return { ok: false, message: detailOf(body, 'Could not start the payment') };
}

/** Poll Stripe directly (used when the webhook has not arrived yet). */
export async function syncBooking(
  reference: string,
): Promise<BookingDetail | null> {
  const response = await fetch(
    `/api/me/bookings/${encodeURIComponent(reference)}/sync`,
    { method: 'POST', credentials: 'include' },
  );
  if (!response.ok) return null;
  return (await readJson(response)) as unknown as BookingDetail;
}

/** £1,234.56 style formatting; GBP is the only live currency today. */
export function formatMoney(pence: number, currency = 'gbp'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(pence / 100);
}


