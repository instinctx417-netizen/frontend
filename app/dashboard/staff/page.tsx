'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi, PaginationMeta } from '@/lib/clientPortalApi';
import { User } from '@/lib/api';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

interface StaffUser extends User {
  fullName?: string;
  phone?: string;
  primaryFunction?: string;
  yearsExperience?: number | string;
  location?: string;
  linkedIn?: string;
  positionTitle?: string;
  hiredAt?: string;
}

export default function ClientStaffPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const hasLoadedRef = useRef(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Allow client users and HR COO
    if (isAuthenticated && (user?.userType === 'client' || (user?.userType === 'hr' && user?.role === 'hr_coo'))) {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        loadOrganization();
      }
    } else if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, user]);

  const loadOrganization = async () => {
    try {
      const response = await clientPortalApi.getOrganizations();
      if (response.success && response.data && response.data.organizations.length > 0) {
        const firstOrg = response.data.organizations[0];
        const orgId = firstOrg.organization_id || firstOrg.id;
        setOrganizationId(orgId);
        loadStaff(orgId, 1);
      } else {
        setError('No organization found');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to load organization:', err);
      setError(err.message || 'Failed to load organization');
      setLoading(false);
    }
  };

  const loadStaff = async (orgId: number, pageToLoad: number = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await clientPortalApi.getOrganizationStaff(orgId, pageToLoad, 10);
      if (response.success && response.data) {
        setStaff(response.data.staff || []);
        setPagination(response.data.pagination || null);
      } else {
        setStaff([]);
        setPagination(null);
        setError(response.message || 'Failed to load staff members');
      }
    } catch (error: any) {
      console.error('Error loading staff members:', error);
      setError(error.message || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination || !organizationId) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadStaff(organizationId, newPage);
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
          <h1 className="text-3xl font-bold text-black">Staff Members</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!error && staff.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No staff members found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="dashboard-table-head-row">
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Name</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Email</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Position</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Hired Date</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-black">
                        {member.fullName || `${member.firstName} ${member.lastName}`}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{member.phone || 'N/A'}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{member.positionTitle || 'N/A'}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {member.hiredAt ? new Date(member.hiredAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {member.linkedIn && (
                            <a
                              href={member.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md cursor-pointer"
                            >
                              LinkedIn
                            </a>
                          )}
                          <a
                            href={`/dashboard/candidates/detail?id=${member.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
                          >
                            View Details
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
                itemLabel="staff members"
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

