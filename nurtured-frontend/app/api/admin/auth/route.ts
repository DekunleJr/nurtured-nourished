import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Backend unreachable (not running / wrong NEXT_PUBLIC_API_URL / network).
    return NextResponse.json(
      { detail: 'Cannot reach the backend API — is it running?' },
      { status: 502 },
    );
  }

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

  // Pass the backend's real status and error detail through so the login
  // screen can say WHY login failed (wrong password vs unknown email vs
  // rate-limited vs deactivated) instead of a generic message.
  const errorBody = await backendResponse.text();
  return new NextResponse(errorBody, {
    status: backendResponse.status,
    headers: {
      'Content-Type': backendResponse.headers.get('content-type') || 'application/json',
    },
  });
}