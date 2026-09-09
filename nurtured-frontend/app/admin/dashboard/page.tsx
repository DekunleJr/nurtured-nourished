'use client';

import { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminUsers from '@/components/admin/AdminUsers';
import StatCards from '@/components/admin/StatCards';
import Tabs from '@/components/admin/Tabs';
import SubmissionsTable from '@/components/admin/SubmissionsTable';
import { useDashboardStats, useSubmissionsTab } from '@/lib/admin-api';
import type { SubmissionType } from '@/lib/admin-api';

export default function AdminDashboard() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const [activeTab, setActiveTab] = useState<SubmissionType>('leads');

  const leadsTab = useSubmissionsTab('leads');
  const discoveryTab = useSubmissionsTab('discovery');
  const contactsTab = useSubmissionsTab('contacts');

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Review and manage enquiries coming through the website.
          </p>
        </div>

        {statsLoading && !stats ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-charcoal/5" />
            ))}
          </div>
        ) : (
          stats && <StatCards stats={stats} />
        )}

        <div className="mt-8">
          <Tabs active={activeTab} onChange={setActiveTab} />
          <div className="mt-6">
            {activeTab === 'leads' && <SubmissionsTable type="leads" tab={leadsTab} />}
            {activeTab === 'discovery' && <SubmissionsTable type="discovery" tab={discoveryTab} />}
            {activeTab === 'contacts' && <SubmissionsTable type="contacts" tab={contactsTab} />}
          </div>
        </div>

        <div className="mt-8">
          <AdminUsers />
        </div>
      </main>
    </div>
  );
}
