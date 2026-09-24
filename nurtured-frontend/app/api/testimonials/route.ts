import { NextResponse } from 'next/server';

/**
 * Public testimonials proxy (/api/testimonials).
 *
 * The browser and server components talk to the same origin only; this
 * handler relays the read-only request to the FastAPI backend. The backend
 * stays the single source of truth — nothing is cached or altered here, so
 * the public pages can never show words the backend does not publish.
 */
const BACKEND = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  if (!BACKEND) {
    return NextResponse.json(
      { detail: 'NEXT_PUBLIC_API_URL is not configured' },
      { status: 500 },
    );
  }

  try {
    const backend = await fetch(`${BACKEND}/api/testimonials`, {
      cache: 'no-store',
    });
    const text = await backend.text();
    return new NextResponse(text || null, {
      status: backend.status,
      headers: {
        'Content-Type': backend.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Cannot reach the backend API — is it running?' },
      { status: 502 },
    );
  }
}
