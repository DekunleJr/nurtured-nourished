'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminAuth, logoutAdmin } from '@/components/utils/admin-auth';

interface DashboardData {
  leads: Array<Record<string, unknown>>;
  discovery: Array<Record<string, unknown>>;
  contacts: Array<Record<string, unknown>>;
  stats: {
    total_leads: number;
    total_discovery: number;
    total_contacts: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await checkAdminAuth();
      if (!authenticated) {
        router.push('/admin/login');
        return;
      }

      // Load dashboard data
      try {
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch {
        setError('Network error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">ERROR: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={logoutAdmin}
            className="text-sm text-gray-600 hover:text-pink-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h3 className="text-2xl font-bold text-pink-600">{data.stats.total_leads}</h3>
              <p className="text-gray-600">Leads</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h3 className="text-2xl font-bold text-pink-600">{data.stats.total_discovery}</h3>
              <p className="text-gray-600">Discovery Bookings</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h3 className="text-2xl font-bold text-pink-600">{data.stats.total_contacts}</h3>
              <p className="text-gray-600">Contact Messages</p>
            </div>
          </div>
        )}

        {!data && (
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-xl font-semibold mb-4">No data available</h2>
            <p className="text-gray-600">No submissions found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
