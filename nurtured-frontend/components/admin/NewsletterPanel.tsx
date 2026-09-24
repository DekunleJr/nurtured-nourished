'use client';

import { useState } from 'react';
import {
  adminPatch,
  downloadAdminCsv,
  isAuthFailure,
  useAdminList,
  type SubscriberRecord,
} from '@/lib/admin-api';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Newsletter subscribers: captures from the site's signup form.
 *
 * "Unsubscribe" is a soft archive rather than a delete — the row stays as a
 * suppression record, and it is automatically un-archived if the same address
 * signs up again.
 */
export default function NewsletterPanel() {
  const { items, loading, error, setError, includeDeleted, setIncludeDeleted, refresh } =
    useAdminList<SubscriberRecord>('newsletter');

  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  async function toggle(subscriber: SubscriberRecord) {
    setBusyId(subscriber.id);
    setError('');
    setNotice('');
    try {
      await adminPatch(
        `newsletter/${subscriber.id}/${subscriber.is_deleted ? 'restore' : 'archive'}`,
      );
      setNotice(
        subscriber.is_deleted
          ? `${subscriber.email} restored to the list`
          : `${subscriber.email} unsubscribed`,
      );
      await refresh();
    } catch (err) {
      if (!isAuthFailure(err)) {
        setError(err instanceof Error ? err.message : 'Could not update the subscriber');
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-charcoal/60">
          {items.length} {items.length === 1 ? 'subscriber' : 'subscribers'}
          {includeDeleted ? ' (including unsubscribed)' : ''}
        </p>
        <div className="flex-1" />
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-charcoal/70">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={() => setIncludeDeleted(!includeDeleted)}
            className="h-4 w-4 accent-primary"
          />
          Show unsubscribed
        </label>
        <button
          onClick={async () => {
            try {
              await downloadAdminCsv('newsletter', 'newsletter-subscribers.csv', includeDeleted);
            } catch {
              // downloadAdminCsv redirects to login on an expired session
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

      {loading && items.length === 0 ? (
        <div className="h-24 animate-pulse rounded-2xl bg-charcoal/5" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-charcoal">No subscribers yet</p>
          <p className="mt-1 text-sm text-charcoal/60">
            Signups from the website newsletter form appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream/60">
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Email</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Source</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Signed up</th>
                  <th className="px-5 py-3 font-semibold text-charcoal/70">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-charcoal/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className={`border-b border-charcoal/5 transition-colors ${
                      subscriber.is_deleted
                        ? 'bg-cream/40 text-charcoal/50'
                        : 'hover:bg-primary-soft/30'
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-charcoal">{subscriber.email}</td>
                    <td className="px-5 py-4 text-charcoal/70">{subscriber.source || '—'}</td>
                    <td className="px-5 py-4 text-charcoal/70">
                      {formatDate(subscriber.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          subscriber.is_deleted
                            ? 'bg-charcoal/10 text-charcoal/60'
                            : 'bg-primary-soft text-primary'
                        }`}
                      >
                        {subscriber.is_deleted ? 'Unsubscribed' : 'Subscribed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toggle(subscriber)}
                        disabled={busyId === subscriber.id}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          subscriber.is_deleted
                            ? 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                            : 'bg-peach/40 text-coral hover:bg-coral hover:text-white'
                        }`}
                      >
                        {subscriber.is_deleted ? 'Restore' : 'Unsubscribe'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
