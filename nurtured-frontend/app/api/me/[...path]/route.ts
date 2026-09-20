import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all proxy for the customer checkout API (/api/me/*).
 *
 * The browser talks to the same origin only; this handler relays the request
 * (path, method, body and the session cookie) to the FastAPI backend, which
 * owns every decision: authentication, cohort eligibility, plan maths and
 * Stripe. Nothing is decided here, so the UI can never disagree with what is
 * charged.
 */
const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

async function relay(
  segments: string[],
  request: NextRequest,
): Promise<NextResponse> {
  const path = segments.map((s) => encodeURIComponent(s)).join('/');
  const search = request.nextUrl.search || '';
  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }
  try {
    const backend = await fetch(`${BACKEND}/api/me/${path}${search}`, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      body,
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

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return relay(path, request);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return relay(path, request);
}
