import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (Next 16 renaming of middleware) — runs before routes render.

 * Protects the admin area at the edge: if a request for /admin/* (except the
 * login page and the /api/admin/* endpoints, which perform their own auth)
 * doesn't carry an `admin-session` cookie, redirect to the login page.
 *
 * This is deliberately only a cheap presence check. The session is *verified*
 * server-side by the FastAPI backend on every API call, so a forged cookie
 * still cannot reach any data.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If we're on a page under /admin (not /admin/login, not /api/admin/*) and
  // there's no session cookie, bounce to login.
  const isAdminPage =
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    !pathname.startsWith('/admin/api');

  if (isAdminPage && !request.cookies.get('admin-session')) {
    const login = new URL('/admin/login', request.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};