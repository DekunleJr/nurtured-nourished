import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/bookings → proxy to the FastAPI booking endpoint.
 *
 * Keeps the browser talking to the same origin (no cross-origin form posts);
 * the backend owns validation, capacity checks and Stripe checkout creation.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/bookings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': request.headers.get('x-booking-attempt') ?? '',
      },
      body: body || undefined,
      cache: 'no-store',
    },
  );

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}