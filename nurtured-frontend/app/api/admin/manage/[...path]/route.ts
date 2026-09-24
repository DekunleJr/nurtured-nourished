import { NextRequest } from 'next/server';
import { proxyAdminPassthrough } from '@/lib/admin-proxy';

/**
 * Catch-all proxy for the managed admin API (packages, cohorts, bookings,
 * customers, testimonials, newsletter).
 *
 * Forwards every method to the FastAPI backend under /api/admin/:path with the
 * browser's session cookie, keeping the query string (pagination, search,
 * include_deleted) intact. Passthrough mode keeps the backend's status codes
 * and error details (e.g. "A package with this slug already exists") intact.
 */
function withSearch(path: string, request: NextRequest): string {
  const search = request.nextUrl.search ?? '';
  return search ? `${path}${search}` : path;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyAdminPassthrough(withSearch(path.join('/'), request), request, {
    method: 'GET',
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const body = await request.text();
  return proxyAdminPassthrough(withSearch(path.join('/'), request), request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body || undefined,
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const body = await request.text();
  return proxyAdminPassthrough(withSearch(path.join('/'), request), request, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body || undefined,
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const body = await request.text();
  return proxyAdminPassthrough(withSearch(path.join('/'), request), request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body || undefined,
  });
}