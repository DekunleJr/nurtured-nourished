'use client';

import { useState } from 'react';
import type { SubmissionRecord, SubmissionType } from '@/lib/admin-api';
import type { useSubmissionsTab } from '@/lib/admin-api';
import AdminToolbar from '@/components/admin/AdminToolbar';
import PaginationBar from '@/components/admin/PaginationBar';

interface SubmissionsTableProps {
  type: SubmissionType;
  tab: ReturnType<typeof useSubmissionsTab>;
}

function getColumns(type: SubmissionType) {
  if (type === 'leads') {
    return {
      lead: { label: 'Organisation', value: 'organisation' },
      meta: [
        { label: 'Contact', value: 'contact_name' },
        { label: 'Job title', value: 'job_title' },
        { label: 'Email', value: 'email' },
      ],
      detail: [{ label: 'Goals', value: 'goals' }],
    };
  }
  if (type === 'discovery') {
    return {
      lead: { label: 'Name', value: 'name' },
      meta: [
        { label: 'Email', value: 'email' },
        { label: 'Due date', value: 'due_date' },
        { label: 'Postcode', value: 'postcode' },
        { label: 'Package', value: 'package' },
      ],
      detail: [],
    };
  }
  return {
    lead: { label: 'Name', value: 'name' },
    meta: [
      { label: 'Email', value: 'email' },
      { label: 'Subject', value: 'subject' },
    ],
    detail: [{ label: 'Message', value: 'message' }],
  };
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function cellValue(row: SubmissionRecord, key: string): string {
  const v = (row as unknown as Record<string, unknown>)[key];
  if (v === null || v === undefined) return '—';
  return String(v);
}

export default function SubmissionsTable({ type, tab }: SubmissionsTableProps) {
  const { data, loading, error, state, setQuery, setPage, setPerPage, toggleSort, toggleIncludeDeleted, toggleItem } =
    tab;
  const [expanded, setExpanded] = useState<number | null>(null);
  const cols = getColumns(type);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <AdminToolbar
        type={type}
        query={state.query}
        onQueryChange={setQuery}
        includeDeleted={state.includeDeleted}
        onToggleArchived={toggleIncludeDeleted}
      />

      {error && (
        <div className="rounded-xl border border-coral/30 bg-peach/30 px-4 py-3 text-sm text-coral">{error}</div>
      )}

      {loading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
          ))}
        </div>
      ) : data && items.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-charcoal">No {type} found</p>
          <p className="mt-1 text-sm text-charcoal/60">
            {state.query
              ? 'Try a different search term.'
              : state.includeDeleted
                ? 'No records at all — active or archived.'
                : 'New submissions will appear here.'}
          </p>
        </div>
      ) : (
        <TableBody
          type={type}
          items={items}
          cols={cols}
          expanded={expanded}
          setExpanded={setExpanded}
          sortState={state.sort}
          sortOrder={state.order}
          toggleSort={toggleSort}
          toggleItem={toggleItem}
          totalPages={totalPages}
          page={state.page}
          perPage={state.perPage}
          setPage={setPage}
          setPerPage={setPerPage}
        />
      )}
    </div>
  );
}
import type { TabState } from '@/lib/admin-api';

interface TableBodyProps {
  type: SubmissionType;
  items: SubmissionRecord[];
  cols: ReturnType<typeof getColumns>;
  expanded: number | null;
  setExpanded: (id: number | null) => void;
  toggleSort: (col: TabState['sort']) => void;
  toggleItem: (id: number, archived: boolean) => void;
  totalPages: number;
  page: number;
  perPage: number;
  setPage: (p: number) => void;
  setPerPage: (n: number) => void;
  sortState: TabState['sort'];
  sortOrder: TabState['order'];
}

function TableBody({
  items,
  cols,
  expanded,
  setExpanded,
  toggleSort,
  toggleItem,
  totalPages,
  page,
  perPage,
  setPage,
  setPerPage,
  sortState,
  sortOrder,
}: TableBodyProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-charcoal/10 bg-cream/60">
            <th className="px-5 py-3 font-semibold text-charcoal/70">
              <button onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-primary">
                {cols.lead.label}
                {sortState === 'name' && <SortArrow order={sortOrder} />}
              </button>
            </th>
            {cols.meta.map((m) => (
              <th key={m.value} className="hidden px-5 py-3 font-semibold text-charcoal/70 md:table-cell">
                {m.label}
              </th>
            ))}
            <th className="px-5 py-3 font-semibold text-charcoal/70">
              <button
                onClick={() => toggleSort('created_at')}
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                Received
                {sortState === 'created_at' && <SortArrow order={sortOrder} />}
              </button>
            </th>
            <th className="px-5 py-3 text-right font-semibold text-charcoal/70">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <TableRow
              key={`${row.id}-row`}
              rec={row as SubmissionRecord}
              cols={cols}
              isArchived={Boolean((row as SubmissionRecord).is_deleted)}
              isExpanded={expanded === row.id}
              setExpanded={setExpanded}
              toggleItem={toggleItem}
            />
          ))}
        </tbody>
      </table>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  );
}

function TableRow({
  rec,
  cols,
  isArchived,
  isExpanded,
  setExpanded,
  toggleItem,
}: {
  rec: SubmissionRecord;
  cols: ReturnType<typeof getColumns>;
  isArchived: boolean;
  isExpanded: boolean;
  setExpanded: (id: number | null) => void;
  toggleItem: (id: number, archived: boolean) => void;
}) {
  return (
    <>
      <tr
        className={`border-b border-charcoal/5 transition-colors ${isArchived ? 'bg-cream/40 text-charcoal/50' : 'hover:bg-primary-soft/30'}`}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            {isArchived && (
              <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
                Archived
              </span>
            )}
            <span className="font-semibold text-charcoal">{cellValue(rec, cols.lead.value)}</span>
          </div>
        </td>
        {cols.meta.map((m) => (
          <td key={m.value} className="hidden px-5 py-4 text-charcoal/70 md:table-cell">
            {cellValue(rec, m.value)}
          </td>
        ))}
        <td className="px-5 py-4 text-charcoal/70">{formatDate(String(rec.created_at))}</td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-2">
            {cols.detail.length > 0 && (
              <button
                onClick={() => setExpanded(isExpanded ? null : rec.id)}
                className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
              >
                {isExpanded ? 'Hide' : 'View'}
              </button>
            )}
            <button
              onClick={() => toggleItem(rec.id, isArchived)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isArchived
                  ? 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                  : 'bg-peach/40 text-coral hover:bg-coral hover:text-white'
              }`}
            >
              {isArchived ? 'Restore' : 'Archive'}
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-primary-soft/20">
          <td colSpan={cols.meta.length + 3} className="px-5 py-4">
            {cols.detail.map((d) => (
              <div key={d.value} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">{d.label}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/80">{cellValue(rec, d.value)}</p>
              </div>
            ))}
            <div className="mt-3 grid gap-2 text-xs text-charcoal/50 sm:grid-cols-2">
              <p>Received: {formatDate(String(rec.created_at))}</p>
              <p>Last updated: {formatDate(String(rec.updated_at))}</p>
              <p>ID: {rec.id}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SortArrow({ order }: { order: 'asc' | 'desc' }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={order === 'asc' ? '6 9 12 15 18 9' : '18 15 12 9 6 15'} />
    </svg>
  );
}