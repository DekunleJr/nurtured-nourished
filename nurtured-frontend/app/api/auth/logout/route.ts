import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, proxyAuthRequest } from '@/lib/auth-proxy';

/**
 * POST /api/auth/logout → sign out.
 *
 * The token is a stateless JWT, so invalidating it server-side is best-effort;
 * the part that actually signs the person out is clearing the cookie on this
 * origin. That always happens, even if the backend is unreachable.
 */
export async function POST(request: NextRequest) {
  await proxyAuthRequest('logout', request, { method: 'POST' });
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
