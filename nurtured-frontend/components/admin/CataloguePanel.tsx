'use client';

import { useState } from 'react';
import PaginationBar from '@/components/admin/PaginationBar';
import {
  AdminApiError,
  adminPatch,
  adminPost,
  adminPut,
  downloadAdminCsv,
  isAuthFailure,
  useAdminList,
  useBookingsTab,
  type BookingRecord,
  type BookingStatus,
  type CohortRecord,
  type CohortStatus,
  type PackageRecord,
} from '@/lib/admin-api';

const inputCls =
  'w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25';

const COHORT_STATUSES: CohortStatus[] = ['open', 'closing_soon', 'closed'];
const BOOKING_STATUSES: BookingStatus[] = [
  'pending_payment',
  'part_paid',
  'paid',
  'confirmed',
  'cancelled',
];

const statusStyles: Record<string, string> = {
  paid: 'bg-primary-soft text-primary',
  confirmed: 'bg-primary-soft text-primary',
  part_paid: 'bg-peach/40 text-coral',
  pending_payment: 'bg-charcoal/10 text-charcoal/70',
  cancelled: 'bg-coral/15 text-coral',
  open: 'bg-primary-soft text-primary',
  closing_soon: 'bg-peach/40 text-coral',
  closed: 'bg-charcoal/10 text-charcoal/60',
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMoney(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Prices are stored in pence; the UI always talks in pounds. */
function poundsToPence(pounds: number): number {
  return Math.max(0, Math.round(pounds * 100));
}

function prettyStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

interface ListState<T> {
  items: T[];
  loading: boolean;
  error: string;
  setError: (message: string) => void;
  includeDeleted: boolean;
  setIncludeDeleted: (value: boolean) => void;
  refresh: () => Promise<void>;
}

interface Notice {
  error: string;
  notice: string;
  setError: (message: string) => void;
  setNotice: (message: string) => void;
}

function Banners({ error, notice }: { error: string; notice: string }) {
  return (
    <>
      {error && (
        <div className="rounded-xl border border-coral/30 bg-peach/30 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}
    </>
  );
}

function ArchivedToggle({
  includeDeleted,
  onChange,
}: {
  includeDeleted: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-charcoal/70">
      <input
        type="checkbox"
        checked={includeDeleted}
        onChange={() => onChange(!includeDeleted)}
        className="h-4 w-4 accent-primary"
      />
      Show archived
    </label>
  );
}

/**
 * Catalogue: the programmes customers buy, the cohorts they run in, and every
 * booking. Each sub-section owns its own data so editing a cohort does not
 * re-render the booking list, but a booking change refreshes the cohort seat
 * counts it just affected.
 */
export default function CataloguePanel() {
  const [tab, setTab] = useState<'packages' | 'cohorts' | 'bookings'>('packages');
  const packages = useAdminList<PackageRecord>('packages');
  const cohorts = useAdminList<CohortRecord>('cohorts');

  const subTabs = [
    { key: 'packages' as const, label: 'Programmes' },
    { key: 'cohorts' as const, label: 'Cohorts' },
    { key: 'bookings' as const, label: 'Bookings' },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Catalogue">
        {subTabs.map((sub) => (
          <button
            key={sub.key}
            role="tab"
            aria-selected={tab === sub.key}
            onClick={() => setTab(sub.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === sub.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal/70 hover:bg-primary-soft hover:text-primary'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {tab === 'packages' && <PackagesSection list={packages} />}
      {tab === 'cohorts' && (
        <CohortsSection list={cohorts} onChanged={() => void cohorts.refresh()} />
      )}
      {tab === 'bookings' && (
        <BookingsSection
          packages={packages.items}
          cohorts={cohorts.items}
          onChanged={async () => {
            await cohorts.refresh();
          }}
        />
      )}
    </section>
  );
}

interface PackageDraft {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  blurb: string;
  features: string;
  price_note: string;
  cta_label: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

const emptyPackage: PackageDraft = {
  slug: '',
  name: '',
  tagline: '',
  price: 0,
  blurb: '',
  features: '',
  price_note: '',
  cta_label: 'Book your place',
  is_featured: false,
  is_published: true,
  sort_order: 0,
};

function toPackageDraft(p: PackageRecord): PackageDraft {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price: p.price_pence / 100,
    blurb: p.blurb,
    features: (p.features ?? []).join('\n'),
    price_note: p.price_note,
    cta_label: p.cta_label,
    is_featured: p.is_featured,
    is_published: p.is_published,
    sort_order: p.sort_order,
  };
}

/** The API stores pence and a feature array; the form works in pounds/lines. */
function toPackagePayload(draft: PackageDraft) {
  return {
    slug: draft.slug.trim().toLowerCase(),
    name: draft.name.trim(),
    tagline: draft.tagline.trim(),
    price_pence: poundsToPence(draft.price),
    blurb: draft.blurb,
    features: draft.features
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    price_note: draft.price_note,
    cta_label: draft.cta_label.trim() || 'Book your place',
    is_featured: draft.is_featured,
    is_published: draft.is_published,
    sort_order: draft.sort_order,
  };
}

function PackagesSection({ list }: { list: ListState<PackageRecord> }) {
  const { items, loading, error, setError, includeDeleted, setIncludeDeleted, refresh } = list;
  const [editorId, setEditorId] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<PackageDraft>(emptyPackage);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = toPackagePayload(draft);
      if (editorId === 'new') {
        await adminPost<PackageRecord>('packages', payload);
        setNotice(`Programme "${payload.name}" created`);
      } else {
        await adminPut<PackageRecord>(`packages/${editorId}`, payload);
        setNotice(`Programme "${payload.name}" updated`);
      }
      setEditorId(null);
      await refresh();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not save the programme');
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchived(pkg: PackageRecord) {
    setError('');
    setNotice('');
    try {
      await adminPatch(`packages/${pkg.id}/${pkg.is_deleted ? 'restore' : 'archive'}`);
      setNotice(pkg.is_deleted ? 'Programme restored' : 'Programme archived');
      await refresh();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not update the programme');
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ArchivedToggle includeDeleted={includeDeleted} onChange={setIncludeDeleted} />
        <div className="flex-1" />
        <button
          onClick={() => {
            setDraft(emptyPackage);
            setEditorId('new');
            setError('');
            setNotice('');
          }}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          Add programme
        </button>
      </div>

      <Banners error={error} notice={notice} />

      {editorId !== null && (
        <PackageForm
          heading={editorId === 'new' ? 'New programme' : 'Edit programme'}
          draft={draft}
          saving={saving}
          onChange={setDraft}
          onSubmit={submit}
          onCancel={() => setEditorId(null)}
        />
      )}

      {loading && items.length === 0 ? (
        <div className="h-24 animate-pulse rounded-2xl bg-charcoal/5" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-charcoal">No programmes yet</p>
          <p className="mt-1 text-sm text-charcoal/60">
            Add the tiers customers can book — nothing shows publicly until published.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream/60">
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Programme</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Price</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Visibility</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Order</th>
                  <th className="px-5 py-3 text-right font-semibold text-charcoal/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className={`border-b border-charcoal/5 transition-colors ${
                      pkg.is_deleted ? 'bg-cream/40 text-charcoal/50' : 'hover:bg-primary-soft/30'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {pkg.is_deleted && (
                          <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
                            Archived
                          </span>
                        )}
                        <span className="font-semibold text-charcoal">{pkg.name}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-charcoal/50">/{pkg.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-charcoal/70">{formatMoney(pkg.price_pence)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            pkg.is_published
                              ? 'bg-primary-soft text-primary'
                              : 'bg-charcoal/10 text-charcoal/60'
                          }`}
                        >
                          {pkg.is_published ? 'Published' : 'Draft'}
                        </span>
                        {pkg.is_featured && (
                          <span className="rounded-full bg-peach/40 px-2.5 py-0.5 text-xs font-semibold text-coral">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-charcoal/70">{pkg.sort_order}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setDraft(toPackageDraft(pkg));
                            setEditorId(pkg.id);
                            setError('');
                            setNotice('');
                          }}
                          className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleArchived(pkg)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            pkg.is_deleted
                              ? 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                              : 'bg-peach/40 text-coral hover:bg-coral hover:text-white'
                          }`}
                        >
                          {pkg.is_deleted ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageForm({
  heading,
  draft,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  heading: string;
  draft: PackageDraft;
  saving: boolean;
  onChange: (draft: PackageDraft) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-charcoal">{heading}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-charcoal/70">
          Name *
          <input
            className={`${inputCls} mt-1`}
            value={draft.name}
            required
            maxLength={255}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Slug * <span className="font-normal text-charcoal/40">(a-z, 0-9, dashes)</span>
          <input
            className={`${inputCls} mt-1`}
            value={draft.slug}
            required
            maxLength={64}
            pattern="[a-z0-9-]+"
            onChange={(e) => onChange({ ...draft, slug: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Price (£)
          <input
            type="number"
            min={0}
            step="0.01"
            className={`${inputCls} mt-1`}
            value={draft.price}
            onChange={(e) => onChange({ ...draft, price: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70 md:col-span-3">
          Tagline
          <input
            className={`${inputCls} mt-1`}
            value={draft.tagline}
            maxLength={255}
            onChange={(e) => onChange({ ...draft, tagline: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70 md:col-span-3">
          Description
          <textarea
            className={`${inputCls} mt-1 min-h-[90px]`}
            value={draft.blurb}
            maxLength={2000}
            onChange={(e) => onChange({ ...draft, blurb: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70 md:col-span-3">
          What&apos;s included <span className="font-normal text-charcoal/40">(one per line)</span>
          <textarea
            className={`${inputCls} mt-1 min-h-[120px]`}
            value={draft.features}
            onChange={(e) => onChange({ ...draft, features: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Price note
          <input
            className={`${inputCls} mt-1`}
            value={draft.price_note}
            maxLength={255}
            onChange={(e) => onChange({ ...draft, price_note: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Button label
          <input
            className={`${inputCls} mt-1`}
            value={draft.cta_label}
            maxLength={64}
            onChange={(e) => onChange({ ...draft, cta_label: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Display order
          <input
            type="number"
            min={0}
            className={`${inputCls} mt-1`}
            value={draft.sort_order}
            onChange={(e) => onChange({ ...draft, sort_order: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal/70">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={draft.is_published}
            onChange={(e) => onChange({ ...draft, is_published: e.target.checked })}
          />
          Published on the site
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal/70">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={draft.is_featured}
            onChange={(e) => onChange({ ...draft, is_featured: e.target.checked })}
          />
          Highlight as featured
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save programme'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-charcoal/60 transition-colors hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface CohortDraft {
  label: string;
  start_date: string;
  duration_weeks: number;
  session_time: string;
  capacity: number;
  status: CohortStatus;
  notes: string;
}

function emptyCohort(): CohortDraft {
  const start = new Date();
  start.setDate(start.getDate() + 42);
  return {
    label: '',
    start_date: start.toISOString().slice(0, 10),
    duration_weeks: 6,
    session_time: '',
    capacity: 5,
    status: 'open',
    notes: '',
  };
}

function toCohortDraft(c: CohortRecord): CohortDraft {
  return {
    label: c.label,
    start_date: c.start_date,
    duration_weeks: c.duration_weeks,
    session_time: c.session_time,
    capacity: c.capacity,
    status: c.status,
    notes: c.notes,
  };
}

/**
 * Cohorts: the scheduled runs of a programme. Seats are derived from the live
 * bookings (never a stored counter), and the end date shown here is the same
 * derived date the checkout flow compares against a customer's due date.
 */
function CohortsSection({
  list,
  onChanged,
}: {
  list: ListState<CohortRecord>;
  onChanged: () => void;
}) {
  const { items, loading, error, setError, includeDeleted, setIncludeDeleted, refresh } = list;
  const [editorId, setEditorId] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<CohortDraft>(emptyCohort);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editorId === 'new') {
        await adminPost<CohortRecord>('cohorts', draft);
        setNotice(`Cohort "${draft.label}" created`);
      } else {
        await adminPut<CohortRecord>(`cohorts/${editorId}`, draft);
        setNotice(`Cohort "${draft.label}" updated`);
      }
      setEditorId(null);
      await refresh();
      onChanged();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not save the cohort');
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchived(cohort: CohortRecord) {
    setError('');
    setNotice('');
    try {
      await adminPatch(`cohorts/${cohort.id}/${cohort.is_deleted ? 'restore' : 'archive'}`);
      setNotice(cohort.is_deleted ? 'Cohort restored' : 'Cohort archived');
      await refresh();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not update the cohort');
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ArchivedToggle includeDeleted={includeDeleted} onChange={setIncludeDeleted} />
        <div className="flex-1" />
        <button
          onClick={() => {
            setDraft(emptyCohort());
            setEditorId('new');
            setError('');
            setNotice('');
          }}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          Add cohort
        </button>
      </div>

      <Banners error={error} notice={notice} />

      {editorId !== null && (
        <CohortForm
          heading={editorId === 'new' ? 'New cohort' : 'Edit cohort'}
          draft={draft}
          saving={saving}
          onChange={setDraft}
          onSubmit={submit}
          onCancel={() => setEditorId(null)}
        />
      )}

      {loading && items.length === 0 ? (
        <div className="h-24 animate-pulse rounded-2xl bg-charcoal/5" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-charcoal">No cohorts yet</p>
          <p className="mt-1 text-sm text-charcoal/60">
            Add a scheduled run so customers have something to book.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream/60">
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Cohort</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Dates</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Seats</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-charcoal/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((cohort) => {
                  const full = cohort.seats_taken >= cohort.capacity;
                  return (
                    <tr
                      key={cohort.id}
                      className={`border-b border-charcoal/5 transition-colors ${
                        cohort.is_deleted
                          ? 'bg-cream/40 text-charcoal/50'
                          : 'hover:bg-primary-soft/30'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {cohort.is_deleted && (
                            <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
                              Archived
                            </span>
                          )}
                          <span className="font-semibold text-charcoal">{cohort.label}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-charcoal/50">
                          {cohort.session_time || 'No time set'}
                          {cohort.notes ? ` · ${cohort.notes}` : ''}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-charcoal/70">
                        <p>
                          {cohort.start_date} → {cohort.end_date}
                        </p>
                        <p className="mt-0.5 text-xs text-charcoal/50">
                          {cohort.duration_weeks} weeks
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={full ? 'font-semibold text-coral' : 'text-charcoal/70'}
                        >
                          {cohort.seats_taken} / {cohort.capacity}
                        </span>
                        {full && (
                          <span className="ml-2 rounded-full bg-peach/40 px-2.5 py-0.5 text-xs font-semibold text-coral">
                            Full
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            statusStyles[cohort.status] ?? 'bg-charcoal/10 text-charcoal/70'
                          }`}
                        >
                          {prettyStatus(cohort.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setDraft(toCohortDraft(cohort));
                              setEditorId(cohort.id);
                              setError('');
                              setNotice('');
                            }}
                            className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleArchived(cohort)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                              cohort.is_deleted
                                ? 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                                : 'bg-peach/40 text-coral hover:bg-coral hover:text-white'
                            }`}
                          >
                            {cohort.is_deleted ? 'Restore' : 'Archive'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CohortForm({
  heading,
  draft,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  heading: string;
  draft: CohortDraft;
  saving: boolean;
  onChange: (draft: CohortDraft) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const endDate = (() => {
    const start = new Date(`${draft.start_date}T00:00:00Z`);
    if (Number.isNaN(start.getTime())) return '—';
    start.setUTCDate(start.getUTCDate() + (draft.duration_weeks - 1) * 7);
    return start.toISOString().slice(0, 10);
  })();

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-charcoal">{heading}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-charcoal/70 md:col-span-2">
          Label *
          <input
            className={`${inputCls} mt-1`}
            value={draft.label}
            required
            maxLength={255}
            placeholder="Autumn 2026"
            onChange={(e) => onChange({ ...draft, label: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Status
          <select
            className={`${inputCls} mt-1`}
            value={draft.status}
            onChange={(e) => onChange({ ...draft, status: e.target.value as CohortStatus })}
          >
            {COHORT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {prettyStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          First session *
          <input
            type="date"
            className={`${inputCls} mt-1`}
            value={draft.start_date}
            required
            onChange={(e) => onChange({ ...draft, start_date: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Duration (weeks) *
          <input
            type="number"
            min={1}
            max={52}
            className={`${inputCls} mt-1`}
            value={draft.duration_weeks}
            onChange={(e) => onChange({ ...draft, duration_weeks: Number(e.target.value) || 1 })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Capacity *
          <input
            type="number"
            min={1}
            max={100}
            className={`${inputCls} mt-1`}
            value={draft.capacity}
            onChange={(e) => onChange({ ...draft, capacity: Number(e.target.value) || 1 })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Session time
          <input
            className={`${inputCls} mt-1`}
            value={draft.session_time}
            maxLength={64}
            placeholder="Tuesdays 7pm"
            onChange={(e) => onChange({ ...draft, session_time: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70 md:col-span-3">
          Notes
          <textarea
            className={`${inputCls} mt-1 min-h-[80px]`}
            value={draft.notes}
            maxLength={2000}
            onChange={(e) => onChange({ ...draft, notes: e.target.value })}
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-charcoal/50">
        Last session: <strong>{endDate}</strong> — derived from the start date and duration.
        Customers can only book a cohort that finishes before their baby is due.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save cohort'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-charcoal/60 transition-colors hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
interface BookingDraft {
  package_id: number | '';
  cohort_id: number | '';
  name: string;
  email: string;
  due_date: string;
  postcode: string;
  partner_name: string;
  status: BookingStatus;
}

const emptyBooking: BookingDraft = {
  package_id: '',
  cohort_id: '',
  name: '',
  email: '',
  due_date: '',
  postcode: '',
  partner_name: '',
  status: 'confirmed',
};

function toBookingDraft(b: BookingRecord): BookingDraft {
  return {
    package_id: b.package_id,
    cohort_id: b.cohort_id ?? '',
    name: b.name,
    email: b.email,
    due_date: b.due_date,
    postcode: b.postcode,
    partner_name: b.partner_name,
    status: b.status,
  };
}

/**
 * Bookings: every place sold, including manual/offline ones.
 *
 * Creating uses the same reference scheme and seat guard as the public checkout,
 * editing re-snapshots the package name/price if the programme changes, and the
 * seat counts on the Cohorts tab are refreshed after any change made here.
 */
function BookingsSection({
  packages,
  cohorts,
  onChanged,
}: {
  packages: PackageRecord[];
  cohorts: CohortRecord[];
  onChanged: () => Promise<void>;
}) {
  const tab = useBookingsTab();
  const {
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
  } = tab;

  const [editorId, setEditorId] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(emptyBooking);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;

  function payload() {
    return {
      package_id: draft.package_id === '' ? undefined : draft.package_id,
      cohort_id: draft.cohort_id === '' ? null : draft.cohort_id,
      name: draft.name.trim(),
      email: draft.email.trim(),
      due_date: draft.due_date,
      postcode: draft.postcode,
      partner_name: draft.partner_name,
      status: draft.status,
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editorId === 'new') {
        const created = await adminPost<BookingRecord>('bookings', payload());
        setNotice(`Booking ${created.reference} created`);
      } else {
        const updated = await adminPut<BookingRecord>(`bookings/${editorId}`, payload());
        setNotice(`Booking ${updated.reference} updated`);
      }
      setEditorId(null);
      await refresh();
      await onChanged();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not save the booking');
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(booking: BookingRecord, status: BookingStatus) {
    setBusyId(booking.id);
    setError('');
    setNotice('');
    try {
      await adminPatch(`bookings/${booking.id}/status`, { status });
      setNotice(`${booking.reference} marked ${prettyStatus(status)}`);
      await refresh();
      await onChanged();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not update the status');
      }
    } finally {
      setBusyId(null);
    }
  }

  async function toggleArchived(booking: BookingRecord) {
    setBusyId(booking.id);
    setError('');
    setNotice('');
    try {
      await adminPatch(`bookings/${booking.id}/${booking.is_deleted ? 'restore' : 'archive'}`);
      setNotice(booking.is_deleted ? 'Booking restored' : 'Booking archived');
      await refresh();
      await onChanged();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not update the booking');
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={state.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, reference or programme…"
          aria-label="Search bookings"
          className={`${inputCls} min-w-[220px] flex-1`}
        />
        <select
          aria-label="Filter by status"
          value={state.status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | '')}
          className={`${inputCls} w-auto`}
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {prettyStatus(status)}
            </option>
          ))}
        </select>
        <ArchivedToggle includeDeleted={state.includeDeleted} onChange={toggleIncludeDeleted} />
        <button
          onClick={async () => {
            try {
              await downloadAdminCsv('bookings', 'bookings-export.csv', state.includeDeleted);
            } catch {
              // downloadAdminCsv redirects to login on an expired session
            }
          }}
          className="rounded-full border border-charcoal/15 px-5 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
        >
          Export CSV
        </button>
        <button
          onClick={() => {
            setDraft({ ...emptyBooking, package_id: packages[0]?.id ?? '' });
            setEditorId('new');
            setError('');
            setNotice('');
          }}
          disabled={packages.length === 0}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add booking
        </button>
      </div>

      <Banners error={error} notice={notice} />
      {packages.length === 0 && (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-charcoal/60">
          Add a programme first — every booking needs one.
        </p>
      )}

      {editorId !== null && (
        <BookingForm
          heading={editorId === 'new' ? 'New booking' : 'Edit booking'}
          draft={draft}
          packages={packages}
          cohorts={cohorts}
          saving={saving}
          onChange={setDraft}
          onSubmit={submit}
          onCancel={() => setEditorId(null)}
        />
      )}

      {loading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-charcoal">No bookings found</p>
          <p className="mt-1 text-sm text-charcoal/60">
            {state.query || state.status
              ? 'Try clearing the search or status filter.'
              : 'Sales and manual bookings appear here.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream/60">
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Customer</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Programme</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Paid</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Status</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Cohort</th>
                  <th className="px-5 py-3 text-right font-semibold text-charcoal/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((booking) => {
                  const cohort = cohorts.find((c) => c.id === booking.cohort_id);
                  return (
                    <tr
                      key={booking.id}
                      className={`border-b border-charcoal/5 transition-colors ${
                        booking.is_deleted
                          ? 'bg-cream/40 text-charcoal/50'
                          : 'hover:bg-primary-soft/30'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {booking.is_deleted && (
                            <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
                              Archived
                            </span>
                          )}
                          <span className="font-semibold text-charcoal">{booking.name}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-charcoal/50">
                          {booking.email} · {booking.reference}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-charcoal/70">
                        <p>{booking.package_name}</p>
                        <p className="mt-0.5 text-xs text-charcoal/50">
                          {formatMoney(booking.package_price_pence)}
                          {booking.due_date ? ` · due ${booking.due_date}` : ''}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-charcoal/70">
                        {formatMoney(booking.amount_paid_pence)}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Status for ${booking.reference}`}
                          value={booking.status}
                          disabled={busyId === booking.id}
                          onChange={(e) =>
                            void changeStatus(booking, e.target.value as BookingStatus)
                          }
                          className={`rounded-lg border border-charcoal/15 px-2 py-1 text-xs font-semibold ${
                            statusStyles[booking.status] ?? 'text-charcoal/70'
                          }`}
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {prettyStatus(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-charcoal/70">
                        {cohort ? cohort.label : booking.cohort_id ? `#${booking.cohort_id}` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setDraft(toBookingDraft(booking));
                              setEditorId(booking.id);
                              setError('');
                              setNotice('');
                            }}
                            className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleArchived(booking)}
                            disabled={busyId === booking.id}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                              booking.is_deleted
                                ? 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                                : 'bg-peach/40 text-coral hover:bg-coral hover:text-white'
                            }`}
                          >
                            {booking.is_deleted ? 'Restore' : 'Archive'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationBar
            page={state.page}
            totalPages={totalPages}
            perPage={state.perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      )}
    </div>
  );
}

function BookingForm({
  heading,
  draft,
  packages,
  cohorts,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  heading: string;
  draft: BookingDraft;
  packages: PackageRecord[];
  cohorts: CohortRecord[];
  saving: boolean;
  onChange: (draft: BookingDraft) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  // Only live cohorts with a free seat can be assigned — the backend rejects
  // anything else with 409, so the picker never offers an impossible choice.
  const assignable = cohorts.filter((c) => !c.is_deleted && c.seats_taken < c.capacity);

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-charcoal">{heading}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-charcoal/70">
          Programme *
          <select
            className={`${inputCls} mt-1`}
            value={draft.package_id}
            required
            onChange={(e) =>
              onChange({ ...draft, package_id: e.target.value ? Number(e.target.value) : '' })
            }
          >
            <option value="">Choose a programme…</option>
            {packages
              .filter((pkg) => !pkg.is_deleted)
              .map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {formatMoney(pkg.price_pence)}
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Cohort
          <select
            className={`${inputCls} mt-1`}
            value={draft.cohort_id}
            onChange={(e) =>
              onChange({ ...draft, cohort_id: e.target.value ? Number(e.target.value) : '' })
            }
          >
            <option value="">No cohort (unassigned)</option>
            {assignable.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.label} — {cohort.capacity - cohort.seats_taken} seat(s) left
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Status
          <select
            className={`${inputCls} mt-1`}
            value={draft.status}
            onChange={(e) => onChange({ ...draft, status: e.target.value as BookingStatus })}
          >
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {prettyStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Customer name *
          <input
            className={`${inputCls} mt-1`}
            value={draft.name}
            required
            maxLength={255}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Email *
          <input
            type="email"
            className={`${inputCls} mt-1`}
            value={draft.email}
            required
            maxLength={255}
            onChange={(e) => onChange({ ...draft, email: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Due date
          <input
            type="date"
            className={`${inputCls} mt-1`}
            value={draft.due_date}
            onChange={(e) => onChange({ ...draft, due_date: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Postcode
          <input
            className={`${inputCls} mt-1`}
            value={draft.postcode}
            maxLength={16}
            onChange={(e) => onChange({ ...draft, postcode: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Partner / supporter
          <input
            className={`${inputCls} mt-1`}
            value={draft.partner_name}
            maxLength={255}
            onChange={(e) => onChange({ ...draft, partner_name: e.target.value })}
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-charcoal/50">
        Changing the programme re-records its name and price on this booking, exactly as a new
        checkout would. A cohort can never be oversold.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save booking'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-charcoal/60 transition-colors hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}


