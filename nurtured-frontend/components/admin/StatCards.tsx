'use client';

import type { DashboardStats } from '@/lib/admin-api';

interface StatCardsProps {
  stats: DashboardStats['stats'];
}

const cardMeta = [
  {
    key: 'leads' as const,
    label: 'Commissioning Leads',
    accent: 'text-primary',
    chipBg: 'bg-primary-soft text-primary',
  },
  {
    key: 'discovery' as const,
    label: 'Discovery Bookings',
    accent: 'text-coral',
    chipBg: 'bg-peach/40 text-coral',
  },
  {
    key: 'contacts' as const,
    label: 'Contact Messages',
    accent: 'text-charcoal',
    chipBg: 'bg-cream text-charcoal',
  },
];

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cardMeta.map((card) => {
        const s = stats[card.key];
        return (
          <div
            key={card.key}
            className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold tracking-wide text-charcoal/60">
              {card.label}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <span className={`text-4xl font-bold ${card.accent}`}>{s?.total ?? 0}</span>
              {typeof s?.new_this_week === 'number' && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${card.chipBg}`}
                >
                  +{s.new_this_week} this week
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}