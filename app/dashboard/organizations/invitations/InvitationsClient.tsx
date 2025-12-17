'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/app/dashboard/layout';
import { clientPortalApi, UserInvitation } from '@/lib/clientPortalApi';

export default function InvitationsClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { selectedOrganizationId, setSelectedOrganizationId, organizationId } = useDashboard();
  
  // Use selectedOrganizationId if set, otherwise fall back to organizationId from context
  const currentOrgId = selectedOrganizationId || organizationId;

  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const hasLoadedRef = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    departmentId: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client' && user?.role !== 'coo') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.userType === 'client' && currentOrgId && !isNaN(currentOrgId) && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadInvitations();
    } else if (!currentOrgId) {
      // If no organization selected, redirect back to organizations
      router.push('/dashboard/organizations/invitations');
    }
  }, [isAuthenticated, authLoading, user, currentOrgId, router]);

  const loadInvitations = async () => {
    if (!currentOrgId || isNaN(currentOrgId)) {
      setError('Invalid organization ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await clientPortalApi.getInvitations(currentOrgId);
      if (response.success && response.data) {
        setInvitations(response.data.invitations);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentOrgId) return;

    try {
      const response = await clientPortalApi.createInvitation(currentOrgId, {
        email: formData.email,
        role: formData.role,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
      });

      if (response.success) {
        setShowForm(false);
        setFormData({ email: '', role: 'member', departmentId: '' });
        await loadInvitations();
      } else {
        setError(response.message || 'Failed to create invitation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    }
  };


  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client' || (user?.userType === 'client' && user?.role !== 'coo')) {
    return null;
  }

  if (!currentOrgId || isNaN(currentOrgId)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No organization selected</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">Invitations</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
          >
            {showForm ? 'Cancel' : '+ Invite Member'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="colleague@company.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-black mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="hr_coordinator">HR Coordinator</option>
                  <option value="coo">COO</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        )}

        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No invitations sent yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
            >
              Send First Invitation
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {invitation.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {invitation.role.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invitation.status === 'approved' ? 'dashboard-badge-success' :
                          invitation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          invitation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          invitation.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invitation.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invitation.createdAt 
                          ? new Date(invitation.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


