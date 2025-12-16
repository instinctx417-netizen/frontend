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
        <h1 className="text-3xl font-bold text-black mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/dashboard/job-requests" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">Job Requests</p>
            <p className="text-5xl font-bold text-black">{stats.jobRequests}</p>
          </Link>
          <Link href="/admin/dashboard/invitations" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">Pending Invitations</p>
            <p className="text-5xl font-bold text-black">{stats.pendingInvitations}</p>
          </Link>
          <Link href="/admin/dashboard/hr-users" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">HR Users</p>
            <p className="text-5xl font-bold text-black">{stats.hrUsers}</p>
          </Link>
          <Link href="/admin/dashboard/organizations" className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
            <p className="text-sm text-gray-600 mb-3 font-light">Organizations</p>
            <p className="text-5xl font-bold text-black">{stats.organizations}</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/dashboard/invitations"
              className="p-4 border border-gray-200 rounded-lg hover:border-black transition-colors"
                >
              <h3 className="font-semibold text-black mb-2">Review Invitations</h3>
              <p className="text-sm text-gray-600">Approve or reject pending team invitations</p>
            </Link>
            <Link
              href="/admin/dashboard/job-requests"
              className="p-4 border border-gray-200 rounded-lg hover:border-black transition-colors"
            >
              <h3 className="font-semibold text-black mb-2">Assign HR to Jobs</h3>
              <p className="text-sm text-gray-600">Assign HR users to new job requests</p>
            </Link>
            <Link
              href="/admin/dashboard/hr-users"
              className="p-4 border border-gray-200 rounded-lg hover:border-black transition-colors"
            >
              <h3 className="font-semibold text-black mb-2">Manage HR Users</h3>
              <p className="text-sm text-gray-600">Create and manage HR user accounts</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
