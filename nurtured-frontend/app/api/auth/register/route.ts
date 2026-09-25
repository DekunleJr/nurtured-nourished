import { NextRequest } from 'next/server';
import { proxyAuthRequest } from '@/lib/auth-proxy';

/**
 * POST /api/auth/register → create a customer account.
 *
 * The backend creates the account first, then verifies the emailed OTP before
 * issuing the customer session. The client then resumes the requested checkout.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyAuthRequest('register', request, {
    method: 'POST',
    body: body || undefined,
  });
}
