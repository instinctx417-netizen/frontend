'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { hrApi } from '@/lib/clientPortalApi';
import Link from 'next/link';

export default function HRDashboardOverview() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    assignedCount: 0,
    shortlistingCount: 0,
    deliveredCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'hr') {
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [isAuthenticated, user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getDashboardStats();
      if (response.success && response.data) {
        console.log('HR Dashboard Stats Response:', response.data);
        setStats(response.data.statistics || {
          assignedCount: 0,
          shortlistingCount: 0,
          deliveredCount: 0,
          totalCount: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">HR Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/hr/dashboard/job-requests" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">Total Assigned</p>
            <p className="text-5xl font-bold text-black">{stats.totalCount}</p>
          </Link>
          <Link href="/hr/dashboard/job-requests" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">Assigned to HR</p>
            <p className="text-5xl font-bold text-black">{stats.assignedCount}</p>
          </Link>
          <Link href="/hr/dashboard/job-requests" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">Shortlisting</p>
            <p className="text-5xl font-bold text-black">{stats.shortlistingCount}</p>
          </Link>
          <Link href="/hr/dashboard/job-requests" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">Candidates Delivered</p>
            <p className="text-5xl font-bold text-black">{stats.deliveredCount}</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/hr/dashboard/job-requests"
              className="p-4 border border-gray-200 rounded-lg hover:border-black transition-colors"
          >
              <h3 className="font-semibold text-black mb-2">View Job Requests</h3>
              <p className="text-sm text-gray-600">Manage assigned job requests and push candidates</p>
            </Link>
            <Link
              href="/hr/dashboard/candidates"
              className="p-4 border border-gray-200 rounded-lg hover:border-black transition-colors"
            >
              <h3 className="font-semibold text-black mb-2">Browse Candidates</h3>
              <p className="text-sm text-gray-600">View and manage candidate profiles</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
