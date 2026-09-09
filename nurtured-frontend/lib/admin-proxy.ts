import { NextRequest, NextResponse } from 'next/server';

/**
 * Shared helper for the admin API proxy routes.
 *
 * Forwards the browser's session cookie to the FastAPI backend so the
 * backend can authenticate every request against the admin-session cookie.
 * The Next.js layer never trusts the cookie itself — it only relays it.
 *
 * @param path    Path under the API base, e.g. 'leads/12/archive'
 * @param request Incoming NextRequest (used for the Cookie header + any query)
 * @param init    Optional fetch options (method, body, headers)
 */
export async function proxyAdminRequest(
  path: string,
  request: NextRequest,
  init: RequestInit = {},
): Promise<NextResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/${path}`;
  const headers: Record<string, string> = {
    Cookie: request.headers.get('cookie') || '',
    ...((init.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Request failed (${response.status})` },
      { status: response.status },
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    return NextResponse.json(data);
  }

  // Pass through non-JSON (e.g. CSV export) with the right content type.
  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': contentType || 'text/plain',
      'Content-Disposition': response.headers.get('content-disposition') || '',
    },
  });
}