import { NextRequest } from 'next/server';
import { proxyAdminRequest } from '@/lib/admin-proxy';

/** GET /api/admin/:type/export → download CSV for a submission type. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> },
) {
  const { type } = await context.params;
  const search = request.nextUrl.search; // include_deleted=true passthrough
  return proxyAdminRequest(`${type}/export${search}`, request, { method: 'GET' });
}