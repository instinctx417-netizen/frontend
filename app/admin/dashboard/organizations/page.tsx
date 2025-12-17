'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/clientPortalApi';
import Link from 'next/link';

export default function AdminOrganizationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrgId, setUpdatingOrgId] = useState<number | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<any | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadOrganizations();
    }
  }, [isAuthenticated, user]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllOrganizations();
      if (response.success && response.data) {
        setOrganizations(response.data.organizations || []);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (organizationId: number, currentStatus: string) => {
    try {
      setUpdatingOrgId(organizationId);
      let response;
      
      if (currentStatus === 'active') {
        response = await adminApi.deactivateOrganization(organizationId);
      } else {
        // If status is 'inactive' or undefined/null, activate it
        response = await adminApi.activateOrganization(organizationId);
      }

      if (response.success) {
        // Reload organizations to get updated status
        await loadOrganizations();
      } else {
        alert(response.message || 'Failed to update organization status');
      }
    } catch (error: any) {
      console.error('Error updating organization status:', error);
      alert(error.message || 'Failed to update organization status');
    } finally {
      setUpdatingOrgId(null);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Organizations</h1>
        </div>

        {organizations.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No organizations found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id || org.organization_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {org.name || org.organization_name}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{org.industry || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{org.companySize || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        org.status === 'active' 
                          ? 'dashboard-badge-success' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {org.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(org.id || org.organization_id, org.status || 'inactive')}
                          disabled={updatingOrgId === (org.id || org.organization_id)}
                          className={`px-4 py-2 font-medium transition-colors rounded-md whitespace-nowrap min-w-[100px] ${
                            org.status === 'active'
                              ? 'bg-gray-200 text-black hover:bg-gray-300'
                              : 'dashboard-btn-primary'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingOrgId === (org.id || org.organization_id) 
                            ? 'Updating...' 
                            : org.status === 'active' 
                              ? 'Deactivate' 
                              : 'Activate'}
                        </button>
                        <button 
                          onClick={() => setSelectedOrganization(org)}
                          className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organization Details Modal */}
        {selectedOrganization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Organization Details</h2>
                <button
                  onClick={() => setSelectedOrganization(null)}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-base text-black font-medium">
                      {selectedOrganization.name || selectedOrganization.organization_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOrganization.status === 'active' 
                        ? 'dashboard-badge-success' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrganization.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Industry</label>
                    <p className="text-base text-black">{selectedOrganization.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Company Size</label>
                    <p className="text-base text-black">{selectedOrganization.companySize || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-base text-black">
                      {selectedOrganization.created_at 
                        ? new Date(selectedOrganization.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedOrganization(null)}
                  className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

