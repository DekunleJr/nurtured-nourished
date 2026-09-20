import { NextRequest } from 'next/server';
import { proxyAuthRequest } from '@/lib/auth-proxy';

/**
 * POST /api/auth/login → unified login for admins AND customers.
 *
 * The backend decides which role the credentials belong to; the response body
 * carries `role` so the client knows where to send the person next.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyAuthRequest('login', request, {
    method: 'POST',
    body: body || undefined,
  });
}
