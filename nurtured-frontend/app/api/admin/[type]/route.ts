import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/:type  →  proxy to FastAPI admin list endpoint.
 *
 * Forwards the browser's session cookie so the backend can authenticate.
 * Query params (page, per_page, q, sort, order, include_deleted) pass through.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;

  const search = request.nextUrl.search;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/${type}${search}`,
    {
      credentials: 'include',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const text = await response.text();
    return NextResponse.json(
      { error: text || 'Failed to load submissions' },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}