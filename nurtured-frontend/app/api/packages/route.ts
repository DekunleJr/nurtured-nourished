import { NextRequest, NextResponse } from 'next/server';

/**
 * Public catalogue proxy (/api/packages).
 *
 * The browser talks to the same origin only; this handler relays the read-only
 * catalogue request to the FastAPI backend. The backend stays the single
 * source of truth for packages and prices — nothing is cached or altered
 * here, so the checkout flow can never resolve a slug the backend does not
 * currently publish.
 */
const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search || '';
  try {
    const backend = await fetch(`${BACKEND}/api/packages${search}`, {
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
