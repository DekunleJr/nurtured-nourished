'use client';

import type { SubmissionType } from '@/lib/admin-api';

interface AdminToolbarProps {
  type: SubmissionType;
  query: string;
  onQueryChange: (q: string) => void;
  includeDeleted: boolean;
  onToggleArchived: () => void;
}

export default function AdminToolbar({
  type,
  query,
  onQueryChange,
  includeDeleted,
  onToggleArchived,
}: AdminToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${type}…`}
          aria-label={`Search ${type}`}
          className="w-full rounded-full border border-charcoal/15 bg-white px-5 py-2.5 pr-10 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </span>
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-charcoal/70">
        <input
          type="checkbox"
          checked={includeDeleted}
          onChange={onToggleArchived}
          className="h-4 w-4 accent-primary"
        />
        Show archived
      </label>

      <button
        onClick={async () => {
          try {
            const { downloadCsv } = await import('@/lib/admin-api');
            await downloadCsv(type, includeDeleted);
          } catch {
            // swallowed; the export helper navigates to login on 401
          }
        }}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
      >
        Export CSV
      </button>
    </div>
  );
}