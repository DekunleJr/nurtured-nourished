'use client';

/**
 * The customer dashboard (/my): every purchase with its instalment schedule,
 * the next payment due, and the "pay now" action for the outstanding one.
 *
 * Returning from Stripe lands here with ?ref=<booking reference>; when that
 * parameter is present the matching booking is reconciled against Stripe once
 * (the webhook may not have fired yet in local development).
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookingDetail,
  fetchMyBookings,
  formatMoney,
  payInstalment,
  syncBooking,
} from '@/lib/checkout';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Awaiting first payment',
  part_paid: 'Part paid',
  paid: 'Paid in full',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const INSTALMENT_LABEL: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

export default function MyPage() {
  const [bookings, setBookings] = useState<BookingDetail[] | null>(null);
  const [error, setError] = useState('');
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const syncedRef = useRef(false);

  const load = useCallback(async () => {
    const items = await fetchMyBookings();
    setBookings(items);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMyBookings().then((items) => {
      if (!cancelled) setBookings(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Coming back from Stripe (?ref=…): reconcile that booking once.
  useEffect(() => {
    if (syncedRef.current) return;
    const reference = new URLSearchParams(window.location.search).get('ref');
    if (!reference) return;
    syncedRef.current = true;
    (async () => {
      await syncBooking(reference);
      await load();
      // Clean the parameter so a refresh does not re-poll.
      window.history.replaceState({}, '', '/my');
    })();
  }, [load]);

  const pay = useCallback(
    async (booking: BookingDetail) => {
      if (!booking.next_instalment) return;
      setBusyRef(booking.reference);
      setError('');
      const result = await payInstalment(
        booking.reference,
        booking.next_instalment.sequence,
      );
      if (result.ok && result.url) {
        window.location.href = result.url;
        return;
      }
      setBusyRef(null);
      setError(result.message ?? 'Could not start the payment — please try again.');
    },
    [],
  );

  if (bookings === null) {
    return (
      <section className="bg-primary-soft/40 py-24">
        <p className="text-center text-charcoal/60">Loading your account…</p>
      </section>
    );
  }

  return (
    <section className="bg-primary-soft/40 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
              Your account
            </p>
            <h1 className="display-2 mt-2 font-serif font-semibold text-charcoal">
              My bookings
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/packages"
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Book another programme
            </Link>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-coral/10 p-4 text-sm text-coral-dark">{error}</p>
        )}

        {bookings.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-charcoal/10 bg-white p-10 text-center">
            <p className="text-charcoal/70">
              You have no bookings yet. Browse the programmes to secure your place.
            </p>
            <Link
              href="/packages"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              View packages
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.reference}
                booking={booking}
                busy={busyRef === booking.reference}
                onPay={pay}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** One purchase: course details, instalment schedule and the pay action. */
function BookingCard({
  booking,
  busy,
  onPay,
}: {
  booking: BookingDetail;
  busy: boolean;
  onPay: (booking: BookingDetail) => void;
}) {
  const currency = booking.package_currency;
  const fullyPaid = !booking.next_instalment;
  const cohort = booking.cohort;

  return (
    <li className="rounded-2xl border border-charcoal/10 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            {booking.package_name}
          </h2>
          {cohort && (
            <p className="mt-1 text-sm text-charcoal/70">
              {cohort.label} · {formatDate(cohort.start_date)} –{' '}
              {formatDate(cohort.end_date)}
              {cohort.session_time ? ` · ${cohort.session_time}` : ''}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            fullyPaid
              ? 'bg-primary/10 text-primary-dark'
              : 'bg-coral/10 text-coral-dark'
          }`}
        >
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </div>

      {booking.instalments.length > 1 && !fullyPaid && cohort && (
        <p className="mt-4 rounded-xl bg-coral/10 p-3 text-xs leading-5 text-coral-dark">
          Please note: all instalments must be completed before your cohort
          starts on {formatDate(cohort.start_date)}.
        </p>
      )}

      <ul className="mt-5 divide-y divide-charcoal/5">
        {booking.instalments.map((instalment) => (
          <li
            key={instalment.sequence}
            className="flex flex-wrap items-center justify-between gap-2 py-3"
          >
            <span className="text-sm font-semibold text-charcoal">
              Payment {instalment.sequence} of {booking.instalments_total}
            </span>
            <span className="text-sm text-charcoal/70">
              due {formatDate(instalment.due_date)}
            </span>
            <span className="text-sm font-semibold text-charcoal">
              {formatMoney(instalment.amount_pence, currency)}
            </span>
            <span
              className={`text-xs font-bold ${
                instalment.status === 'paid'
                  ? 'text-primary-dark'
                  : instalment.status === 'overdue'
                    ? 'text-coral-dark'
                    : 'text-charcoal/50'
              }`}
            >
              {INSTALMENT_LABEL[instalment.status] ?? instalment.status}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/5 pt-5">
        <p className="text-sm text-charcoal/70">
          Paid so far:{' '}
          <span className="font-semibold text-charcoal">
            {formatMoney(booking.amount_paid_pence, currency)}
          </span>{' '}
          of {formatMoney(booking.package_price_pence, currency)}
        </p>
        {!fullyPaid && booking.payment_enabled && booking.status !== 'cancelled' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onPay(booking)}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
          >
            {busy
              ? 'Starting payment…'
              : `Pay ${formatMoney(booking.next_instalment!.amount_pence, currency)}`}
          </button>
        )}
        {!booking.payment_enabled && !fullyPaid && (
          <p className="text-xs italic text-charcoal/55">
            Online payments are coming soon — we will email you a secure link
            for your remaining instalment.
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-charcoal/45">
        Reference: {booking.reference}
      </p>
    </li>
  );
}

