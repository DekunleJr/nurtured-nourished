import { NextRequest, NextResponse } from 'next/server';

/** The single session cookie shared by the backend, Next.js and the browser. */
export const SESSION_COOKIE = 'nn-session';

/**
 * Forward a request to a public auth endpoint on the FastAPI backend and pass
 * the response straight back — status, JSON body (including error `detail`) and
 * Set-Cookie.
 *
 * The backend owns the session: it mints and validates the JWT, and this layer
 * only relays the cookie. That keeps exactly one source of truth, so the
 * Next.js side never has to know how to sign or verify a token.
 *
 * @param path    Endpoint under /api/auth, e.g. 'login' or 'register'
 * @param request Incoming NextRequest (used for the Cookie header)
 * @param init    Optional fetch options (method, body)
 */
export async function proxyAuthRequest(
  path: string,
  request: NextRequest,
  init: RequestInit = {},
): Promise<NextResponse> {
  let backend: Response;
  try {
    backend = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
        // Forward the visitor's IP so the backend's per-IP login lockout has a
        // real client to key on. Without it every login would appear to come from
        // the Next.js server, and one person's lockout would block everyone.
        'X-Forwarded-For':
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          '',
        ...((init.headers as Record<string, string>) || {}),
      },
      cache: 'no-store',
    });
  } catch {
    // Backend unreachable (not running / wrong NEXT_PUBLIC_API_URL / network).
    return NextResponse.json(
      { detail: 'Cannot reach the backend API — is it running?' },
      { status: 502 },
    );
  }

  const text = await backend.text();
  const response = new NextResponse(text || null, {
    status: backend.status,
    headers: {
      'Content-Type': backend.headers.get('content-type') || 'application/json',
    },
  });

  const setCookie = backend.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
  return response;
}

/** Clear the session cookie on this origin. */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}
