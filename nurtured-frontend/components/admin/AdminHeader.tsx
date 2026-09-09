'use client';

import Link from 'next/link';
import { logoutAdmin } from '@/components/utils/admin-auth';

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-cream/95 backdrop-blur">
      <div className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 text-center text-xs sm:text-sm">
          <span className="font-medium">Nurtured &amp; Nourished — Admin Portal</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/admin/dashboard" className="shrink-0" aria-label="Admin dashboard">
          <span className="font-serif text-xl font-bold text-primary">
            Nurtured &amp; Nourished
          </span>
          <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-charcoal/70 transition-colors hover:text-primary"
          >
            View site
          </a>
          <button
            onClick={async () => {
              await logoutAdmin();
            }}
            className="rounded-full bg-coral px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}