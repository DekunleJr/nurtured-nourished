'use client';

/**
 * Client-side helpers for the unified login/registration used by admins and
 * customers. The session itself lives in an HttpOnly cookie owned by the
 * backend — these helpers only talk to the Next.js /api/auth proxy routes.
 */

export type SessionRole = 'admin' | 'user';

export interface Session {
  id: number;
  email: string;
  name: string;
  role: SessionRole;
  due_date?: string | null;
  phone?: string | null;
}

/** Where each role lands after signing in, when no `?next=` was supplied. */
export const HOME_FOR_ROLE: Record<SessionRole, string> = {
  admin: '/admin/dashboard',
  user: '/my',
};

export interface AuthResult {
  ok: boolean;
  message?: string;
  session?: Session;
}

/**
 * Only ever return a same-origin, relative path.
 *
 * `?next=` arrives from the URL, so without this check it could be pointed at
 * `//evil.com` or `https://evil.com` and used as an open redirect after login.
 * Anything that isn't a plain rooted path resolves to null.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

/**
 * The destination for a signed-in session: a role-compatible interrupted page,
 * else that role's home.
 */
export function destinationFor(session: Session, next?: string | null): string {
  const safeNext = safeNextPath(next);
  if (safeNext) {
    const isAdminDestination = safeNext === '/admin' || safeNext.startsWith('/admin/');
    const isUserDestination =
      safeNext === '/my' ||
      safeNext.startsWith('/my/') ||
      safeNext === '/checkout' ||
      safeNext.startsWith('/checkout?') ||
      safeNext.startsWith('/checkout/');

    if ((session.role === 'admin' && isAdminDestination) || (session.role === 'user' && isUserDestination)) {
      return safeNext;
    }
  }
  return HOME_FOR_ROLE[session.role] ?? '/';
}

async function readBody(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toSession(body: Record<string, unknown>): Session | undefined {
  if (typeof body.role !== 'string' || (body.role !== 'admin' && body.role !== 'user')) {
    return undefined;
  }
  return {
    id: Number(body.id),
    email: String(body.email ?? ''),
    name: String(body.name ?? ''),
    role: body.role,
    due_date: (body.due_date as string | null) ?? null,
    phone: (body.phone as string | null) ?? null,
  };
}

/** Sign in as an admin or a customer — the backend decides which. */
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await readBody(response);
    if (response.ok) {
      return { ok: true, session: toSession(body) };
    }
    // Surface the backend's specific reason (rate-limited, deactivated, etc.).
    return {
      ok: false,
      message: String(body.detail ?? body.error ?? `Login failed (${response.status})`),
    };
  } catch {
    return { ok: false, message: 'Network error — could not reach the login API' };
  }
}

export interface RegisterPayload {
  name: string;
  email: string;
  due_date: string;
  phone: string;
  password: string;
}

/**
 * Create a customer account. The backend signs the new customer in as part of
 * registration, so on success a session is already established.
 */
export async function register(payload: RegisterPayload): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await readBody(response);
    if (response.ok) {
      return { ok: true, session: toSession(body) };
    }
    return {
      ok: false,
      message: firstValidationError(body) ?? String(body.detail ?? `Sign-up failed (${response.status})`),
    };
  } catch {
    return { ok: false, message: 'Network error — could not reach the registration API' };
  }
}

/** Turn FastAPI's 422 validation array into the first human-readable message. */
function firstValidationError(body: Record<string, unknown>): string | undefined {
  const detail = body.detail;
  if (!Array.isArray(detail)) return undefined;
  const first = detail[0] as { msg?: string } | undefined;
  return first?.msg ? String(first.msg).replace(/^Value error, /, '') : undefined;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  // Navigation is handled by the calling component via useRouter.
}

/** The current session, or null when signed out. */
export async function fetchSession(): Promise<Session | null> {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) return null;
    return toSession(await readBody(response)) ?? null;
  } catch {
    return null;
  }
}

/** Read the `?next=` parameter from the current URL (client-side only). */
export function currentNextParam(): string | null {
  if (typeof window === 'undefined') return null;
  return safeNextPath(new URLSearchParams(window.location.search).get('next'));
}
