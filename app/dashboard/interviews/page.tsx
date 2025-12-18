'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi, Interview, PaginationMeta } from '@/lib/clientPortalApi';
import { useDashboard } from '../layout';
import { useToast } from '@/contexts/ToastContext';
import Pagination from '@/components/Pagination';

type InterviewStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export default function ClientInterviewsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { organizationId } = useDashboard();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<InterviewStatus>('all');
  const [showAllInterviews, setShowAllInterviews] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client') {
      loadInterviews(1);
    }
  }, [isAuthenticated, authLoading, user, organizationId, statusFilter, showAllInterviews]);

  const loadInterviews = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== 'all' ? statusFilter : undefined;
      
      let response;
      if (showAllInterviews) {
        // Load all organization interviews with status filter
        response = organizationId 
          ? await clientPortalApi.getOrganizationInterviews(organizationId, statusParam, pageToLoad, 10)
          : { success: false, data: { interviews: [] } };
      } else {
        // Load assigned interviews with status filter
        response = await clientPortalApi.getParticipantInterviews(statusParam, pageToLoad, 10);
      }

      if (response.success && response.data) {
        setInterviews(response.data.interviews || []);
        setPagination(response.data.pagination || null);
      } else {
        setInterviews([]);
        setPagination(null);
        showToast('Something went wrong...', 'error');
      }
    } catch (error: any) {
      console.error('Error loading interviews:', error);
      setInterviews([]);
      showToast('Something went wrong...', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadInterviews(newPage);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Scheduled Interviews</h1>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllInterviews}
                onChange={(e) => setShowAllInterviews(e.target.checked)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>All Interviews</span>
            </label>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Filter by Status:</span>
          <div className="flex items-center gap-4">
            {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as InterviewStatus[]).map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusFilter"
                  value={status}
                  checked={statusFilter === status}
                  onChange={(e) => setStatusFilter(e.target.value as InterviewStatus)}
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600">
              {showAllInterviews 
                ? 'No interviews found for your organization' 
                : 'No interviews assigned to you'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="dashboard-table-head-row">
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Candidate</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Department</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Scheduled At</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Platform</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Scheduled By</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-black">
                        {interview.job_title || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {interview.candidate_name || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {(interview as any).department_name || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {interview.durationMinutes || 60} min
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {interview.meeting_platform || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'completed' ? 'dashboard-badge-success' :
                          interview.status === 'confirmed' ? 'dashboard-badge-primary' :
                          interview.status === 'scheduled' ? 'dashboard-badge-default' :
                          'dashboard-badge-default'
                        }`}>
                          {interview.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {(interview as any).scheduled_by_first_name && (interview as any).scheduled_by_last_name
                          ? `${(interview as any).scheduled_by_first_name} ${(interview as any).scheduled_by_last_name}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            const jobRequestId = interview.jobRequestId || (interview as any).job_request_id;
                            if (jobRequestId) {
                              router.push(`/dashboard/job-requests/detail?jobRequestId=${jobRequestId}`);
                            }
                          }}
                          className="dashboard-btn-primary px-3 py-2 rounded text-xs font-medium"
                          disabled={!interview.jobRequestId && !(interview as any).job_request_id}
                        >
                          View Job Request
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
                itemLabel="interviews"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}


