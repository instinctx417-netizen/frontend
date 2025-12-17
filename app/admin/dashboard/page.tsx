'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/clientPortalApi';
import Link from 'next/link';

export default function AdminDashboardOverview() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    hrUsers: 0,
    pendingInvitations: 0,
    jobRequests: 0,
    organizations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [isAuthenticated, user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [hrResponse, invitationsResponse, jobRequestsResponse, organizationsResponse] = await Promise.all([
        adminApi.getHRUsers(),
        adminApi.getPendingInvitations(),
        adminApi.getAllJobRequests(),
        adminApi.getAllOrganizations(),
      ]);

      if (hrResponse.success && hrResponse.data) {
        setStats(prev => ({ ...prev, hrUsers: hrResponse.data?.users.length || 0 }));
      }

      if (invitationsResponse.success && invitationsResponse.data) {
        setStats(prev => ({ ...prev, pendingInvitations: invitationsResponse.data?.invitations.length || 0 }));
      }

      if (jobRequestsResponse.success && jobRequestsResponse.data) {
        setStats(prev => ({ ...prev, jobRequests: jobRequestsResponse.data?.jobRequests.length || 0 }));
      }

      if (organizationsResponse.success && organizationsResponse.data) {
        setStats(prev => ({ ...prev, organizations: organizationsResponse.data?.organizations.length || 0 }));
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
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/dashboard/job-requests" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Job Requests</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.jobRequests}</p>
          </Link>
          <Link href="/admin/dashboard/invitations" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Pending Invitations</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-secondary)' }}>{stats.pendingInvitations}</p>
          </Link>
          <Link href="/admin/dashboard/hr-users" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>HR Users</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-accent)' }}>{stats.hrUsers}</p>
          </Link>
          <Link href="/admin/dashboard/organizations" className="dashboard-card rounded-lg p-6">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Organizations</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-success)' }}>{stats.organizations}</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/dashboard/invitations"
              className="p-4 rounded-lg dashboard-card"
                >
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Review Invitations</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Approve or reject pending team invitations</p>
            </Link>
            <Link
              href="/admin/dashboard/job-requests"
              className="p-4 rounded-lg dashboard-card"
            >
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Assign HR to Jobs</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Assign HR users to new job requests</p>
            </Link>
            <Link
              href="/admin/dashboard/hr-users"
              className="p-4 rounded-lg dashboard-card"
            >
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Manage HR Users</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Create and manage HR user accounts</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
