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
      if (res.status === 401) {
        router.push('/admin/login');
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
    fetchData();
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
        if (res.status === 401) {
          router.push('/admin/login');
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
      if (res.status === 401) {
        router.push('/admin/login');
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
    fetchStats();
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
  if (res.status === 401) {
    window.location.href = '/admin/login';
    return;
  }
  if (!res.ok) throw new Error('CSV export failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}-export.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}