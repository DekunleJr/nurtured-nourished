'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type SubmissionType = 'leads' | 'discovery' | 'contacts';

export interface LeadRecord {
  id: number;
  organisation: string;
  contact_name: string;
  job_title: string;
  email: string;
  goals: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface DiscoveryRecord {
  id: number;
  name: string;
  email: string;
  due_date: string;
  postcode: string;
  package: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ContactRecord {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export type SubmissionRecord = LeadRecord | DiscoveryRecord | ContactRecord;

export interface ListResponse<T = SubmissionRecord> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface DashboardStats {
  stats: {
    leads: { total: number; new_this_week: number };
    discovery: { total: number; new_this_week: number };
    contacts: { total: number; new_this_week: number };
  };
}

export interface TabState {
  page: number;
  perPage: number;
  query: string;
  sort: 'created_at' | 'updated_at' | 'name';
  order: 'asc' | 'desc';
  includeDeleted: boolean;
}

export const defaultTabState: TabState = {
  page: 1,
  perPage: 10,
  query: '',
  sort: 'created_at',
  order: 'desc',
  includeDeleted: false,
};

/**
 * Client-side workspace for a single submission tab.
 * Handles fetching the paginated list, debounced search, sorting, pagination,
 * and archive/restore actions. Any 401 redirects the whole app to the login page.
 */
export function useSubmissionsTab(type: SubmissionType) {
  const router = useRouter();
  const [state, setState] = useState<TabState>(defaultTabState);
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounced query so we don't fire a request per keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(state.query), 300);
    return () => clearTimeout(t);
  }, [state.query]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(state.page),
        per_page: String(state.perPage),
        sort: state.sort,
        order: state.order,
      });
      if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
      if (state.includeDeleted) params.set('include_deleted', 'true');

      const res = await fetch(`/api/admin/${type}?${params.toString()}`, {
        credentials: 'include',
      });
      // 401 = no session at all; 403 = a signed-in *customer* session. Either way
      // this person must sign in as an admin, and `next` brings them back here.
      if (res.status === 401 || res.status === 403) {
        router.push('/login?next=/admin/dashboard');
        return;
      }
      if (!res.ok) {
        setError(`Failed to load ${type}`);
        return;
      }
      const json = (await res.json()) as ListResponse;
      setData(json);
    } catch {
      setError('Network error loading data');
    } finally {
      setLoading(false);
    }
  }, [type, state.page, state.perPage, state.sort, state.order, state.includeDeleted, debouncedQuery, router]);

  useEffect(() => {
    // Deferred by one tick so fetchData's synchronous setLoading(true) runs
    // outside the effect body (react-hooks/set-state-in-effect).
    const t = setTimeout(fetchData, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  const setQuery = useCallback((q: string) => {
    setState((s) => ({ ...s, query: q, page: 1 }));
  }, []);

  const setPage = useCallback((p: number) => {
    setState((s) => ({ ...s, page: p }));
  }, []);

  const setPerPage = useCallback((n: number) => {
    setState((s) => ({ ...s, perPage: n, page: 1 }));
  }, []);

  const toggleSort = useCallback((col: TabState['sort']) => {
    setState((s) => ({
      ...s,
      sort: col,
      order: s.order === 'asc' && s.sort === col ? 'desc' : 'asc',
    }));
  }, []);

  const toggleIncludeDeleted = useCallback(() => {
    setState((s) => ({ ...s, includeDeleted: !s.includeDeleted, page: 1 }));
  }, []);

  const toggleItem = useCallback(
    async (id: number, archived: boolean) => {
      try {
        const res = await fetch(
          `/api/admin/${type}/${id}/${archived ? 'restore' : 'archive'}`,
          { method: 'PATCH', credentials: 'include' },
        );
        if (res.status === 401 || res.status === 403) {
          router.push('/login?next=/admin/dashboard');
          return;
        }
        if (res.ok) {
          fetchData();
        } else {
          setError(`Failed to ${archived ? 'restore' : 'archive'} record`);
        }
      } catch {
        setError('Network error updating record');
      }
    },
    [type, router, fetchData],
  );

  return {
    data,
    loading,
    error,
    state,
    setQuery,
    setPage,
    setPerPage,
    toggleSort,
    toggleIncludeDeleted,
    toggleItem,
  };
}

/**
 * Fetch + refresh dashboard stat cards.
 */
export function useDashboardStats() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        router.push('/login?next=/admin/dashboard');
        return;
      }
      if (!res.ok) {
        setError('Failed to load dashboard stats');
        return;
      }
      const json = (await res.json()) as DashboardStats;
      setStats(json.stats);
    } catch {
      setError('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Deferred by one tick so fetchStats' synchronous setLoading(true) runs
    // outside the effect body (react-hooks/set-state-in-effect).
    const t = setTimeout(fetchStats, 0);
    return () => clearTimeout(t);
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

/**
 * Trigger a CSV download for a submission type via the admin proxy.
 */
export async function downloadCsv(type: SubmissionType, includeDeleted = false): Promise<void> {
  const params = new URLSearchParams();
  if (includeDeleted) params.set('include_deleted', 'true');
  const res = await fetch(`/api/admin/${type}/export?${params.toString()}`, {
    credentials: 'include',
  });
  if (res.status === 401 || res.status === 403) {
    sendToAdminLogin();
    return;
  }
  if (!res.ok) throw new Error('CSV export failed');
  saveBlob(await res.blob(), `${type}-export.csv`);
}

/** Back-office management clients (customers, catalogue, content, admins).
 *
 * Every one of these areas is reached through the single catch-all proxy
 * `/api/admin/manage/*` (app/api/admin/manage/[...path]/route.ts), which relays
 * the session cookie to FastAPI and hands the backend's status + `detail`
 * message straight back.
 */
export interface ManagedList<T> {
  items: T[];
  total: number;
}

export interface PagedList<T> extends ManagedList<T> {
  page: number;
  per_page: number;
}

/** A failed admin call, carrying the backend's own status and message. */
export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

/** Hard-redirect to sign-in, remembering where the admin was heading. */
export function sendToAdminLogin(): void {
  // Intentional full reload: the session is gone (or belongs to a customer), so
  // every cached admin response must be dropped too. useRouter is unavailable
  // in a plain module-level helper.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = '/login?next=/admin/dashboard';
}

export interface AdminCustomer {
  id: number;
  email: string;
  name: string;
  phone: string;
  postcode: string;
  due_date: string;
  is_active: boolean;
  bookings_count: number;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean;
}

export interface CustomerBooking {
  id: number;
  reference: string;
  package_name: string;
  status: BookingStatus;
  amount_paid_pence: number;
  created_at: string | null;
}

export interface CustomerDetail extends AdminCustomer {
  bookings: CustomerBooking[];
}

export type CohortStatus = 'open' | 'closing_soon' | 'closed';

export type BookingStatus =
  | 'pending_payment'
  | 'part_paid'
  | 'paid'
  | 'confirmed'
  | 'cancelled';

export interface PackageRecord {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  price_pence: number;
  currency: string;
  blurb: string;
  features: string[];
  price_note: string;
  cta_label: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean;
}

export interface CohortRecord {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
  duration_weeks: number;
  session_time: string;
  capacity: number;
  status: CohortStatus;
  notes: string;
  seats_taken: number;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean;
}

export interface BookingRecord {
  id: number;
  reference: string;
  cohort_id: number | null;
  package_id: number;
  package_name: string;
  package_price_pence: number;
  package_currency: string;
  name: string;
  email: string;
  due_date: string;
  postcode: string;
  partner_name: string;
  payment_plan: string;
  instalments_total: number;
  amount_paid_pence: number;
  status: BookingStatus;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean;
}

export interface TestimonialRecord {
  id: number;
  name: string;
  location: string;
  package: string;
  quote: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean;
}

export interface SubscriberRecord {
  id: number;
  email: string;
  source: string;
  created_at: string | null;
  is_deleted: boolean;
}

/**
 * Call an admin endpoint through the manage proxy.
 *
 * Throws `AdminApiError` carrying the backend's own message (e.g. "A package
 * with this slug already exists") so callers can surface the real reason a
 * write was refused instead of a generic failure string.
 */
export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/admin/manage/${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...((init.headers as Record<string, string>) || {}),
      },
    });
  } catch {
    throw new AdminApiError('Network error — please try again', 0);
  }

  if (res.status === 401 || res.status === 403) {
    sendToAdminLogin();
    throw new AdminApiError('Session expired', res.status);
  }

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const payload = body as { detail?: string; error?: string } | null;
    throw new AdminApiError(payload?.detail ?? payload?.error ?? `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

/** JSON write helpers — `adminRequest` handles headers, errors and 401/403. */
export function adminPost<T>(path: string, body: unknown): Promise<T> {
  return adminRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function adminPut<T>(path: string, body: unknown): Promise<T> {
  return adminRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function adminPatch<T>(path: string, body?: unknown): Promise<T> {
  return adminRequest<T>(path, {
    method: 'PATCH',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Download a CSV export from an admin endpoint (include_deleted optional). */
export async function downloadAdminCsv(
  path: string,
  filename: string,
  includeDeleted = false,
): Promise<void> {
  const params = includeDeleted ? '?include_deleted=true' : '';
  const res = await fetch(`/api/admin/manage/${path}/export${params}`, {
    credentials: 'include',
  });
  if (res.status === 401 || res.status === 403) {
    sendToAdminLogin();
    return;
  }
  if (!res.ok) throw new AdminApiError('CSV export failed', res.status);
  saveBlob(await res.blob(), filename);
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generic loader for the small admin collections (testimonials, subscribers,
 * catalogue) that are returned in full rather than paginated.
 */
export function useAdminList<T>(path: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const suffix = includeDeleted ? '?include_deleted=true' : '';
      const data = await adminRequest<ManagedList<T>>(`${path}${suffix}`, { method: 'GET' });
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : `Failed to load ${path}`);
    } finally {
      setLoading(false);
    }
  }, [path, includeDeleted]);

  useEffect(() => {
    // Deferred by one tick so refresh's synchronous setLoading runs outside the
    // effect body (react-hooks/set-state-in-effect).
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  return { items, loading, error, setError, includeDeleted, setIncludeDeleted, refresh };
}

/** True when a failure was really "your session is gone" (already redirected). */
export function isAuthFailure(err: unknown): boolean {
  return err instanceof AdminApiError && (err.status === 401 || err.status === 403);
}

const CUSTOMER_PAGE_SIZE = 25;

/**
 * Paginated customer workspace: debounced search, archived filter, edit and
 * archive/restore. Customers are never hard-deleted (bookings reference their
 * user_id), so archiving is the only removal action offered.
 */
export function useCustomersTab() {
  const [state, setState] = useState({
    page: 1,
    perPage: CUSTOMER_PAGE_SIZE,
    query: '',
    includeDeleted: false,
  });
  const [data, setData] = useState<PagedList<AdminCustomer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(state.query), 300);
    return () => clearTimeout(t);
  }, [state.query]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(state.page),
        per_page: String(state.perPage),
      });
      if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
      if (state.includeDeleted) params.set('include_deleted', 'true');
      const json = await adminRequest<PagedList<AdminCustomer>>(`customers?${params}`, {
        method: 'GET',
      });
      setData(json);
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof AdminApiError ? err.message : 'Failed to load customers');
      }
    } finally {
      setLoading(false);
    }
  }, [state.page, state.perPage, state.includeDeleted, debouncedQuery]);

  useEffect(() => {
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const setQuery = useCallback((query: string) => {
    setState((s) => ({ ...s, query, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((s) => ({ ...s, page: Math.max(1, page) }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setState((s) => ({ ...s, perPage, page: 1 }));
  }, []);

  const toggleIncludeDeleted = useCallback(() => {
    setState((s) => ({ ...s, includeDeleted: !s.includeDeleted, page: 1 }));
  }, []);

  /** Load one customer's full record, including their booking history. */
  const loadCustomer = useCallback(
    (id: number) => adminRequest<CustomerDetail>(`customers/${id}`, { method: 'GET' }),
    [],
  );

  /** PATCH only the changed fields so untouched columns can't be clobbered. */
  const updateCustomer = useCallback(
    async (id: number, patch: Partial<AdminCustomer>) => {
      await adminPatch<AdminCustomer>(`customers/${id}`, patch);
      await refresh();
    },
    [refresh],
  );

  const toggleCustomer = useCallback(
    async (id: number, archived: boolean) => {
      setError('');
      try {
        await adminPatch(`customers/${id}/${archived ? 'restore' : 'archive'}`);
        await refresh();
      } catch (err) {
        if (!isAuthFailure(err)) {
          setError(err instanceof AdminApiError ? err.message : 'Update failed');
        }
      }
    },
    [refresh],
  );

  return {
    data,
    loading,
    error,
    setError,
    state,
    setQuery,
    setPage,
    setPerPage,
    toggleIncludeDeleted,
    toggleCustomer,
    updateCustomer,
    loadCustomer,
    refresh,
  };
}

const BOOKING_PAGE_SIZE = 20;

/**
 * Paginated bookings workspace: debounced search, optional status filter and an
 * archived toggle. Seat/status rules live in the backend, so this hook only
 * carries the query state.
 */
export function useBookingsTab() {
  const [state, setState] = useState({
    page: 1,
    perPage: BOOKING_PAGE_SIZE,
    query: '',
    status: '' as BookingStatus | '',
    includeDeleted: false,
  });
  const [data, setData] = useState<PagedList<BookingRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(state.query), 300);
    return () => clearTimeout(t);
  }, [state.query]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(state.page),
        per_page: String(state.perPage),
      });
      if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
      if (state.status) params.set('status', state.status);
      if (state.includeDeleted) params.set('include_deleted', 'true');
      const json = await adminRequest<PagedList<BookingRecord>>(`bookings?${params}`, {
        method: 'GET',
      });
      setData(json);
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof AdminApiError ? err.message : 'Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  }, [state.page, state.perPage, state.status, state.includeDeleted, debouncedQuery]);

  useEffect(() => {
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const setQuery = useCallback((query: string) => {
    setState((s) => ({ ...s, query, page: 1 }));
  }, []);

  const setStatus = useCallback((status: BookingStatus | '') => {
    setState((s) => ({ ...s, status, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((s) => ({ ...s, page: Math.max(1, page) }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setState((s) => ({ ...s, perPage, page: 1 }));
  }, []);

  const toggleIncludeDeleted = useCallback(() => {
    setState((s) => ({ ...s, includeDeleted: !s.includeDeleted, page: 1 }));
  }, []);

  return {
    data,
    loading,
    error,
    setError,
    state,
    setQuery,
    setStatus,
    setPage,
    setPerPage,
    toggleIncludeDeleted,
    refresh,
  };
}
