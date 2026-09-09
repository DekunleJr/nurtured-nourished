import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Fire the backend logout so the server-side session is invalidated too;
  // the response body is not needed — the proxy clears the cookie itself.
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Cookie': request.headers.get('cookie') || '',
    },
  });

  const result = new NextResponse();
  result.cookies.set('admin-session', '', { maxAge: 0, path: '/' });
  return result;
}