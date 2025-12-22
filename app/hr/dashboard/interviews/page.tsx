'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { hrApi, Interview, PaginationMeta, clientPortalApi } from '@/lib/clientPortalApi';
import { useToast } from '@/contexts/ToastContext';
import Pagination from '@/components/Pagination';

type InterviewStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export default function HRInterviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<InterviewStatus>('all');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    interviewId: number;
    newStatus: string;
    currentStatus: string;
    message: string;
  } | null>(null);
  const [pendingStatusChanges, setPendingStatusChanges] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'hr') {
      router.push('/dashboard');
      return;
    }

    loadInterviews();
  }, [isAuthenticated, user, statusFilter]);

  const loadInterviews = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== 'all' ? statusFilter : undefined;
      const response = await hrApi.getAssignedInterviews(statusParam, pageToLoad, 10);
      if (response.success && response.data) {
        setInterviews(response.data.interviews || []);
        setPagination(response.data.pagination || null);
      } else {
        setInterviews([]);
        setPagination(null);
        showToast('Something went wrong...', 'error');
      }
    } catch (error) {
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

  const handleStatusChange = (interviewId: number, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) {
      setPendingStatusChanges(prev => {
        const updated = { ...prev };
        delete updated[interviewId];
        return updated;
      });
      return;
    }

    // Store pending change to show in dropdown
    setPendingStatusChanges(prev => ({ ...prev, [interviewId]: newStatus }));

    const confirmMessages: { [key: string]: string } = {
      'cancelled': 'Are you sure you want to cancel this interview?',
      'completed': 'Mark this interview as completed?',
      'scheduled': 'Change status back to scheduled?',
      'confirmed': 'Confirm this interview?'
    };

    const confirmMessage = confirmMessages[newStatus] || 'Change interview status?';
    setConfirmModal({
      show: true,
      interviewId,
      newStatus,
      currentStatus,
      message: confirmMessage
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmModal) return;

    const successMessages: { [key: string]: string } = {
      'cancelled': 'Interview cancelled successfully',
      'completed': 'Interview marked as completed',
      'scheduled': 'Interview status changed to scheduled',
      'confirmed': 'Interview confirmed'
    };

    try {
      const response = await clientPortalApi.updateInterview(confirmModal.interviewId, { status: confirmModal.newStatus });
      if (response.success) {
        showToast(successMessages[confirmModal.newStatus] || 'Interview status updated successfully', 'success');
        setPendingStatusChanges(prev => {
          const updated = { ...prev };
          delete updated[confirmModal.interviewId];
          return updated;
        });
        setConfirmModal(null);
        loadInterviews(pagination?.page || 1);
      } else {
        showToast('Failed to update interview status', 'error');
        // Reset dropdown on error
        setPendingStatusChanges(prev => {
          const updated = { ...prev };
          delete updated[confirmModal.interviewId];
          return updated;
        });
      }
    } catch (error) {
      console.error('Error updating interview status:', error);
      showToast('Failed to update interview status', 'error');
      // Reset dropdown on error
      setPendingStatusChanges(prev => {
        const updated = { ...prev };
        delete updated[confirmModal.interviewId];
        return updated;
      });
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Scheduled Interviews</h1>
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
            <p className="text-gray-600">No interviews found for your assigned job requests</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="dashboard-table-head-row">
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Candidate</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Organization</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Department</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Date</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Time</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Platform</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Status</th>
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
                        {(interview as any).organization_name || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {(interview as any).department_name || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {interview.scheduled_at 
                          ? new Date(interview.scheduled_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {interview.scheduled_at 
                          ? new Date(interview.scheduled_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {interview.durationMinutes || 60} min
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {interview.meeting_platform || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <select
                          value={pendingStatusChanges[interview.id] || interview.status}
                          onChange={(e) => handleStatusChange(interview.id, e.target.value, interview.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black ${
                            (pendingStatusChanges[interview.id] || interview.status) === 'completed' ? 'dashboard-badge-success' :
                            (pendingStatusChanges[interview.id] || interview.status) === 'confirmed' ? 'dashboard-badge-primary' :
                            (pendingStatusChanges[interview.id] || interview.status) === 'cancelled' ? 'bg-red-100 text-red-800' :
                            (pendingStatusChanges[interview.id] || interview.status) === 'scheduled' ? 'dashboard-badge-default' :
                            'dashboard-badge-default'
                          }`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        {interview.candidateUserId && (
                          <a
                            href={`/hr/dashboard/candidates/detail?id=${interview.candidateUserId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dashboard-btn-primary px-3 py-2 rounded text-xs font-medium cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>View Profile</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        )}
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

        {/* Confirmation Modal */}
        {confirmModal?.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-black mb-4">Confirm Status Change</h2>
              <p className="text-gray-600 mb-6">{confirmModal.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    if (confirmModal) {
                      setPendingStatusChanges(prev => {
                        const updated = { ...prev };
                        delete updated[confirmModal.interviewId];
                        return updated;
                      });
                    }
                    setConfirmModal(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


