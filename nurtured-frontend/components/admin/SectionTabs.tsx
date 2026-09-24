'use client';

export type AdminSection =
  | 'submissions'
  | 'catalogue'
  | 'customers'
  | 'testimonials'
  | 'newsletter'
  | 'admins';

const sections: { key: AdminSection; label: string }[] = [
  { key: 'submissions', label: 'Enquiries' },
  { key: 'catalogue', label: 'Programmes & bookings' },
  { key: 'customers', label: 'Customers' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'newsletter', label: 'Newsletter' },
  { key: 'admins', label: 'Admins' },
];

interface SectionTabsProps {
  active: AdminSection;
  onChange: (section: AdminSection) => void;
}

/**
 * Top-level dashboard navigation. Each section owns its own data fetching, so
 * only the active one mounts and no section can slow another down.
 */
export default function SectionTabs({ active, onChange }: SectionTabsProps) {
  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-wrap gap-2 border-b border-charcoal/10 pb-4"
    >
      {sections.map((section) => {
        const isActive = active === section.key;
        return (
          <button
            key={section.key}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(section.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-charcoal text-white shadow-sm'
                : 'text-charcoal/70 hover:bg-primary-soft hover:text-primary'
            }`}
          >
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
