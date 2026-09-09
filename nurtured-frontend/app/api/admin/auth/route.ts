import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (backendResponse.ok) {
    // Let the backend's Set-Cookie (the session cookie) pass through
    // untouched. This keeps exactly ONE source of truth for the session —
    // the backend — and avoids a stray duplicate cookie being set here.
    const data = await backendResponse.json();
    const response = NextResponse.json(data);
    const setCookie = backendResponse.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}