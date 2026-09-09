import { NextRequest } from 'next/server';
import { proxyAdminRequest } from '@/lib/admin-proxy';

/** PATCH /api/admin/:type/:id/archive → soft-delete a submission. */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params;
  return proxyAdminRequest(`${type}/${id}/archive`, request, { method: 'PATCH' });
}