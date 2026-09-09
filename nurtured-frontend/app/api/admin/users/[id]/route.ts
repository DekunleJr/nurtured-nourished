import { NextRequest } from 'next/server';
import { proxyAdminPassthrough } from '@/lib/admin-proxy';

/**
 * PATCH /api/admin/users/:id → rename / deactivate / reactivate an admin.
 * The backend response (including error `detail` messages) passes through.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return proxyAdminPassthrough(`users/${id}`, request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}