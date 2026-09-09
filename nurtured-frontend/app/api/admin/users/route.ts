import { NextRequest } from 'next/server';
import { proxyAdminPassthrough } from '@/lib/admin-proxy';

/** GET /api/admin/users → list admin accounts. */
export async function GET(request: NextRequest) {
  return proxyAdminPassthrough('users', request, { method: 'GET' });
}

/** POST /api/admin/users → create a new admin account. */
export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyAdminPassthrough('users', request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}