import { NextRequest } from 'next/server';
import { proxyAdminRequest } from '@/lib/admin-proxy';

/** PATCH /api/admin/:type/:id/restore → restore a soft-deleted submission. */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params;
  return proxyAdminRequest(`${type}/${id}/restore`, request, { method: 'PATCH' });
}