import { NextRequest } from 'next/server';
import { proxyAuthRequest } from '@/lib/auth-proxy';

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyAuthRequest('resend-verification', request, {
    method: 'POST',
    body: body || undefined,
  });
}
