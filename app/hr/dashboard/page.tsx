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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p className="font-light" style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>HR Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/hr/dashboard/job-requests" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Total Assigned</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.totalCount}</p>
          </Link>
          <Link href="/hr/dashboard/job-requests" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Assigned to HR</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-secondary)' }}>{stats.assignedCount}</p>
          </Link>
          <Link href="/hr/dashboard/job-requests" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Shortlisting</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-accent)' }}>{stats.shortlistingCount}</p>
          </Link>
          <Link href="/hr/dashboard/job-requests" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Candidates Delivered</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-success)' }}>{stats.deliveredCount}</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/hr/dashboard/job-requests"
              className="p-4 rounded-lg dashboard-card"
          >
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>View Job Requests</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage assigned job requests and push candidates</p>
            </Link>
            <Link
              href="/hr/dashboard/candidates"
              className="p-4 rounded-lg dashboard-card"
            >
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Browse Candidates</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>View and manage candidate profiles</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
