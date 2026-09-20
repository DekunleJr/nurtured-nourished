import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (Next 16 renaming of middleware) — runs before routes render.

 * Guards the account areas at the edge: a request for /admin/* or /my/* without
 * an `nn-session` cookie is sent to the unified /login page, carrying the page it
 * wanted in `?next=` so the person lands back there once signed in.
 *
 * This is deliberately only a cheap presence check — the session is *verified*
 * server-side by the FastAPI backend on every API call, and the role check
 * (admin vs customer) is enforced by the backend too, so a forged cookie still
 * cannot reach any data.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Reachable while signed out.
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // Legacy admin sign-in URL: forward it at the edge with an explicit
  // destination, so old bookmarks still work and no page has to render.
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login?next=%2Fadmin%2Fdashboard', request.url));
  }

  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/my');
  if (isProtected && !request.cookies.get('nn-session')) {
    const login = new URL('/login', request.url);
    // A rooted relative path — never an absolute URL — so `?next=` cannot be
    // used as an open redirect.
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/my/:path*'],
};