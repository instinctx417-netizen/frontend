'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi, PaginationMeta } from '@/lib/clientPortalApi';
import Pagination from '@/components/Pagination';
import { useToast } from '@/contexts/ToastContext';

type ActionType = 'all' | 'created' | 'sent' | 'approved' | 'rejected' | 'accepted' | 'link_accessed' | 'expired' | 'resent' | 'cancelled';

interface InvitationLog {
  id: number;
  invitationId: number;
  actionType: string;
  performedByUserId?: number;
  performedByUserType?: string;
  performedByUserName?: string;
  email: string;
  organizationId?: number;
  organizationName?: string;
  details?: any;
  createdAt: string;
}

export default function AdminInvitationLogsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<InvitationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  // Filters
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionType>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadLogs();
  }, [isAuthenticated, user]);

  const loadLogs = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      const filters: any = {};
      if (actionTypeFilter !== 'all') filters.actionType = actionTypeFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (emailFilter) filters.email = emailFilter;

      const response = await adminApi.getInvitationLogs(filters, pageToLoad, 20);
      if (response.success && response.data) {
        setLogs(response.data.logs || []);
        setPagination(response.data.pagination || null);
      } else {
        setLogs([]);
        setPagination(null);
        showToast('Something went wrong...', 'error');
      }
    } catch (error) {
      console.error('Error loading invitation logs:', error);
      setLogs([]);
      showToast('Something went wrong...', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadLogs(newPage);
  };

  const handleFilterChange = () => {
    loadLogs(1);
  };

  const handleFilterReset = () => {
    setActionTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setEmailFilter('');
    loadLogs(1);
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatLogMessage = (log: InvitationLog) => {
    const userName = log.performedByUserName || 'System';
    const userType = log.performedByUserType ? `(${log.performedByUserType})` : '';
    
    switch (log.actionType) {
      case 'created':
        return `${userName} ${userType} created invitation for ${log.email}`;
      case 'sent':
        return `${userName} ${userType} sent invitation to ${log.email}`;
      case 'approved':
        return `${userName} ${userType} approved invitation for ${log.email}`;
      case 'rejected':
        return `${userName} ${userType} rejected invitation for ${log.email}`;
      case 'accepted':
        return `User accepted invitation for ${log.email}`;
      case 'link_accessed':
        return `Invitation link accessed for ${log.email}`;
      case 'expired':
        return `Invitation expired for ${log.email}`;
      case 'resent':
        return `${userName} ${userType} resent invitation to ${log.email}`;
      case 'cancelled':
        return `${userName} ${userType} cancelled invitation for ${log.email}`;
      default:
        return `${userName} ${userType} performed ${formatActionType(log.actionType)} for ${log.email}`;
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Invitation Logs</h1>
            <p className="text-sm text-gray-600 mt-1">Audit trail of all invitation activities</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard/invitations')}
            className="text-sm text-gray-600 hover:text-black cursor-pointer"
          >
            ← Back to Invitations
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value as ActionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
                <option value="link_accessed">Link Accessed</option>
                <option value="expired">Expired</option>
                <option value="resent">Resent</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="Filter by email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleFilterReset}
              className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleFilterChange}
              className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600">No logs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="dashboard-table-head-row">
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Action</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Email</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Organization</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Performed By</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.actionType === 'created' ? 'bg-green-100 text-green-800' :
                          log.actionType === 'approved' ? 'bg-blue-100 text-blue-800' :
                          log.actionType === 'rejected' ? 'bg-red-100 text-red-800' :
                          log.actionType === 'accepted' ? 'bg-purple-100 text-purple-800' :
                          log.actionType === 'expired' ? 'bg-orange-100 text-orange-800' :
                          log.actionType === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatActionType(log.actionType)}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {log.email}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        {log.organizationName || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        <div>
                          <div className="font-medium text-black">{log.performedByUserName || 'System'}</div>
                          {log.performedByUserType && (
                            <div className="text-xs text-gray-500 capitalize">{log.performedByUserType}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-2 text-sm text-gray-600">
                        <div className="max-w-md">
                          <div className="text-black font-medium">{formatLogMessage(log)}</div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
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
                itemLabel="logs"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

