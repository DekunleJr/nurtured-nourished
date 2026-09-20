import { NextRequest } from 'next/server';
import { proxyAuthRequest } from '@/lib/auth-proxy';

/**
 * GET /api/auth/verify → cheap session check for route guards.
 *
 * Returns `{ valid: true, role, id, email, name }`. Deliberately only a session
 * presence/role check — the backend verifies the token on every data request, so
 * a forged cookie still cannot reach anything.
 */
export async function GET(request: NextRequest) {
  return proxyAuthRequest('verify', request, { method: 'GET' });
}
