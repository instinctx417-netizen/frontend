'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi, HRUser, PaginationMeta } from '@/lib/clientPortalApi';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

export default function AdminHRUsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateHR, setShowCreateHR] = useState(false);
  const [selectedHRUser, setSelectedHRUser] = useState<HRUser | null>(null);
  const hasLoadedRef = useRef(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

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
      loadHRUsers(1);
    }
  }, [isAuthenticated, user]);

  const loadHRUsers = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getHRUsers(pageToLoad, 10);
      if (response.success && response.data) {
        setHrUsers(response.data.users || []);
        setPagination(response.data.pagination || null);
      } else {
        setHrUsers([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error loading HR users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadHRUsers(newPage);
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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">HR Users</h1>
          <button
            onClick={() => setShowCreateHR(true)}
            className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
          >
            + Create HR User
          </button>
        </div>

        {hrUsers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No HR users created yet</p>
            <button
              onClick={() => setShowCreateHR(true)}
              className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
            >
              Create First HR User
            </button>
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
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Created</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hrUsers.map((hrUser) => (
                    <tr key={hrUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-black">
                        {hrUser.firstName} {hrUser.lastName}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{hrUser.email}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{hrUser.phone || 'N/A'}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {hrUser.createdAt
                          ? new Date(hrUser.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => setSelectedHRUser(hrUser)}
                          className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
                        >
                          View Details
                        </button>
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
                itemLabel="HR users"
              />
            )}
          </div>
        )}

        {/* Create HR Modal */}
        {showCreateHR && (
          <CreateHRModal
            onClose={() => {
              setShowCreateHR(false);
              loadHRUsers();
            }}
          />
        )}

        {/* HR User Details Modal */}
        {selectedHRUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">HR User Details</h2>
                <button
                  onClick={() => setSelectedHRUser(null)}
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
                    <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                    <p className="text-base text-black font-medium">{selectedHRUser.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                    <p className="text-base text-black font-medium">{selectedHRUser.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-base text-black">{selectedHRUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-base text-black">{selectedHRUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-base text-black">
                      {selectedHRUser.createdAt
                        ? new Date(selectedHRUser.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedHRUser(null)}
                  className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
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

function CreateHRModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.createHRUser(formData);
      if (response.success) {
        onClose();
      } else {
        setError(response.message || 'Failed to create HR user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create HR user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Create HR User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create HR User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

