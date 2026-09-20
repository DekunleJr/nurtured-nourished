import { NextRequest } from 'next/server';
import { proxyAuthRequest } from '@/lib/auth-proxy';

/**
 * POST /api/auth/register → create a customer account.
 *
 * The backend signs the new customer in as part of registration (it sets the
 * session cookie), so the client can send them straight back to the checkout
 * step they left instead of to a login form.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyAuthRequest('register', request, {
    method: 'POST',
    body: body || undefined,
  });
}
