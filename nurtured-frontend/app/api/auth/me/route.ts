import { NextRequest } from 'next/server';
import { proxyAuthRequest } from '@/lib/auth-proxy';

/**
 * GET /api/auth/me → the signed-in account (role, name, due_date, phone).
 *
 * Used by the checkout gate and the dashboard to decide whether a session is an
 * admin or a customer, and where to send them afterwards.
 */
export async function GET(request: NextRequest) {
  return proxyAuthRequest('me', request, { method: 'GET' });
}
