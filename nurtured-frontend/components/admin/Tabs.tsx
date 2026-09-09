'use client';

import type { SubmissionType } from '@/lib/admin-api';

const tabs: { key: SubmissionType; label: string }[] = [
  { key: 'leads', label: 'Commissioning Leads' },
  { key: 'discovery', label: 'Discovery Bookings' },
  { key: 'contacts', label: 'Contact Messages' },
];

interface TabsProps {
  active: SubmissionType;
  onChange: (t: SubmissionType) => void;
}

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Submission types">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal/70 hover:bg-primary-soft hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}