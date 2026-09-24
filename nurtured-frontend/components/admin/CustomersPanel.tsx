'use client';

import { useState } from 'react';
import PaginationBar from '@/components/admin/PaginationBar';
import {
  isAuthFailure,
  useCustomersTab,
  type AdminCustomer,
  type CustomerDetail,
} from '@/lib/admin-api';

const inputCls =
  'w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/25';

const statusStyles: Record<string, string> = {
  paid: 'bg-primary-soft text-primary',
  confirmed: 'bg-primary-soft text-primary',
  part_paid: 'bg-peach/40 text-coral',
  pending_payment: 'bg-charcoal/10 text-charcoal/70',
  cancelled: 'bg-coral/15 text-coral',
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

/**
 * Customer management: search, archived filter, CSV export, inline edit and
 * archive/restore. There is deliberately no delete button — bookings reference
 * a customer's user_id, so archiving is the only removal this UI offers.
 */
export default function CustomersPanel() {
  const tab = useCustomersTab();
  const {
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
  } = tab;

  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailError, setDetailError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;
  const items = data?.items ?? [];

  async function open(customer: AdminCustomer) {
    if (openId === customer.id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(customer.id);
    setDetail(null);
    setDetailError('');
    setNotice('');
    try {
      setDetail(await loadCustomer(customer.id));
    } catch (err) {
      if (!isAuthFailure(err)) setDetailError('Could not load this customer');
    }
  }

  async function save(id: number, patch: Partial<AdminCustomer>) {
    setSaving(true);
    setNotice('');
    setError('');
    try {
      await updateCustomer(id, patch);
      setDetail(await loadCustomer(id));
      setNotice('Customer updated');
    } catch (err) {
      if (!isAuthFailure(err)) {
        setDetailError(err instanceof Error ? err.message : 'Update failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggle(customer: AdminCustomer) {
    setNotice('');
    setDetailError('');
    await toggleCustomer(customer.id, customer.is_deleted);
    setNotice(customer.is_deleted ? 'Customer restored' : 'Customer archived');
    if (openId === customer.id) setOpenId(null);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={state.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or postcode…"
          aria-label="Search customers"
          className={`${inputCls} min-w-[220px] flex-1`}
        />
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-charcoal/70">
          <input
            type="checkbox"
            checked={state.includeDeleted}
            onChange={toggleIncludeDeleted}
            className="h-4 w-4 accent-primary"
          />
          Show archived
        </label>
        <button
          onClick={async () => {
            try {
              const { downloadAdminCsv } = await import('@/lib/admin-api');
              await downloadAdminCsv('customers', 'customers-export.csv', state.includeDeleted);
            } catch {
              // downloadAdminCsv navigates to login on an expired session
            }
          }}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          Export CSV
        </button>
      </div>

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

      {loading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-charcoal">No customers found</p>
          <p className="mt-1 text-sm text-charcoal/60">
            {state.query
              ? 'Try a different search term.'
              : 'Accounts appear here once someone registers.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream/60">
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Customer</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Contact</th>
                  <th className="hidden px-5 py-3 font-semibold text-charcoal/70 lg:table-cell">
                    Due date
                  </th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Bookings</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-charcoal/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    isOpen={openId === customer.id}
                    detail={openId === customer.id ? detail : null}
                    detailError={openId === customer.id ? detailError : ''}
                    saving={saving}
                    onOpen={() => open(customer)}
                    onToggle={() => toggle(customer)}
                    onSave={save}
                  />
                ))}
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
    </section>
  );
}

interface CustomerRowProps {
  customer: AdminCustomer;
  isOpen: boolean;
  detail: CustomerDetail | null;
  detailError: string;
  saving: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onSave: (id: number, patch: Partial<AdminCustomer>) => Promise<void>;
}

function CustomerRow({
  customer,
  isOpen,
  detail,
  detailError,
  saving,
  onOpen,
  onToggle,
  onSave,
}: CustomerRowProps) {
  return (
    <>
      <tr
        className={`border-b border-charcoal/5 transition-colors ${
          customer.is_deleted ? 'bg-cream/40 text-charcoal/50' : 'hover:bg-primary-soft/30'
        }`}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            {customer.is_deleted && (
              <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
                Archived
              </span>
            )}
            <span className="font-semibold text-charcoal">{customer.name || '—'}</span>
          </div>
          <p className="mt-0.5 text-xs text-charcoal/50">Joined {formatDate(customer.created_at)}</p>
        </td>
        <td className="px-5 py-4 text-charcoal/70">
          <p>{customer.email}</p>
          <p className="mt-0.5 text-xs text-charcoal/50">
            {customer.phone || 'No phone'}
            {customer.postcode ? ` · ${customer.postcode}` : ''}
          </p>
        </td>
        <td className="hidden px-5 py-4 text-charcoal/70 lg:table-cell">
          {customer.due_date || '—'}
        </td>
        <td className="px-5 py-4 text-charcoal/70">{customer.bookings_count}</td>
        <td className="px-5 py-4">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              customer.is_active ? 'bg-primary-soft text-primary' : 'bg-charcoal/10 text-charcoal/60'
            }`}
          >
            {customer.is_active ? 'Active' : 'Deactivated'}
          </span>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onOpen}
              className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary"
            >
              {isOpen ? 'Hide' : 'Manage'}
            </button>
            <button
              onClick={onToggle}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                customer.is_deleted
                  ? 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                  : 'bg-peach/40 text-coral hover:bg-coral hover:text-white'
              }`}
            >
              {customer.is_deleted ? 'Restore' : 'Archive'}
            </button>
          </div>
        </td>
      </tr>

      {isOpen && (
        <tr className="bg-primary-soft/20">
          <td colSpan={6} className="px-5 py-5">
            {detailError && (
              <p className="mb-3 rounded-lg bg-peach/40 px-3 py-2 text-sm text-coral">
                {detailError}
              </p>
            )}
            {!detail ? (
              <p className="text-sm text-charcoal/60">Loading customer…</p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <CustomerEditor
                  key={detail.id}
                  customer={detail}
                  saving={saving}
                  onSave={onSave}
                />
                <BookingHistory detail={detail} />
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function CustomerEditor({
  customer,
  saving,
  onSave,
}: {
  customer: CustomerDetail;
  saving: boolean;
  onSave: (id: number, patch: Partial<AdminCustomer>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone,
    postcode: customer.postcode,
    due_date: customer.due_date,
    is_active: customer.is_active,
  });

  const dirty =
    form.name !== customer.name ||
    form.phone !== customer.phone ||
    form.postcode !== customer.postcode ||
    form.due_date !== customer.due_date ||
    form.is_active !== customer.is_active;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(customer.id, { ...form });
      }}
    >
      <h3 className="text-sm font-bold uppercase tracking-wide text-charcoal/60">
        Account details
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-charcoal/70">
          Name
          <input
            className={`${inputCls} mt-1`}
            value={form.name}
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Phone
          <input
            className={`${inputCls} mt-1`}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Postcode
          <input
            className={`${inputCls} mt-1`}
            value={form.postcode}
            onChange={(e) => setForm({ ...form, postcode: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-charcoal/70">
          Due date
          <input
            type="date"
            className={`${inputCls} mt-1`}
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
        </label>
      </div>

      <label className="mt-4 flex cursor-pointer select-none items-center gap-2 text-sm text-charcoal/70">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />
        Account can sign in (deactivating blocks login immediately)
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() =>
            setForm({
              name: customer.name,
              phone: customer.phone,
              postcode: customer.postcode,
              due_date: customer.due_date,
              is_active: customer.is_active,
            })
          }
          disabled={!dirty}
          className="text-sm font-semibold text-charcoal/60 transition-colors hover:text-primary disabled:opacity-40"
        >
          Reset
        </button>
        <span className="text-xs text-charcoal/40">{customer.email}</span>
      </div>
    </form>
  );
}

function BookingHistory({ detail }: { detail: CustomerDetail }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-charcoal/60">
        Booking history
      </h3>
      {detail.bookings.length === 0 ? (
        <p className="mt-3 text-sm text-charcoal/60">No bookings yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {detail.bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-charcoal/10 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-charcoal">{booking.package_name}</p>
                <p className="text-xs text-charcoal/50">
                  {booking.reference} · {formatDate(booking.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-charcoal/70">
                  {formatMoney(booking.amount_paid_pence)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    statusStyles[booking.status] ?? 'bg-charcoal/10 text-charcoal/70'
                  }`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-charcoal/40">
        Customer ID {detail.id} · Updated {formatDate(detail.updated_at)}
      </p>
    </div>
  );
}
