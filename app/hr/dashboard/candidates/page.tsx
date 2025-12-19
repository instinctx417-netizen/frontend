'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { hrApi, PaginationMeta } from '@/lib/clientPortalApi';
import { User } from '@/lib/api';
import Pagination from '@/components/Pagination';

interface CandidateUser extends User {
  fullName?: string;
  phone?: string;
  primaryFunction?: string;
  yearsExperience?: number | string;
  location?: string;
  linkedIn?: string;
}

export default function HRCandidatesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'hr') {
      router.push('/dashboard');
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCandidates(1);
    }
  }, [isAuthenticated, user]);

  const loadCandidates = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      const response = await hrApi.getCandidateUsers(pageToLoad, 10);
      if (response.success && response.data) {
        setCandidates(response.data.candidates || []);
        setPagination(response.data.pagination || null);
      } else {
        setCandidates([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadCandidates(newPage);
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Candidates</h1>
          <button
            type="button"
            onClick={() => router.push('/hr/dashboard/candidates/new')}
            className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md cursor-pointer"
          >
            Add Candidate
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No registered candidates found</p>
            <p className="text-sm text-gray-500">Candidates need to register first before they can be assigned to job requests.</p>
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
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Function</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Experience</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Location</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-black">
                        {candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{candidate.email}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{candidate.phone || 'N/A'}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{candidate.primaryFunction || 'N/A'}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {candidate.yearsExperience ? `${candidate.yearsExperience} years` : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{candidate.location || 'N/A'}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {candidate.linkedIn && (
                            <a
                              href={candidate.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md cursor-pointer"
                            >
                              LinkedIn
                            </a>
                          )}
                          <a
                            href={`/hr/dashboard/candidates/detail?id=${candidate.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md cursor-pointer"
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
                itemLabel="candidates"
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

