'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi, Interview } from '@/lib/clientPortalApi';
import { useDashboard } from '../layout';

export default function ClientInterviewsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { organizationId } = useDashboard();
  const [activeTab, setActiveTab] = useState<'assigned' | 'all'>('assigned');
  const [assignedInterviews, setAssignedInterviews] = useState<Interview[]>([]);
  const [allInterviews, setAllInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadInterviews();
    }
  }, [isAuthenticated, authLoading, user, organizationId]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const [assignedResponse, allResponse] = await Promise.all([
        clientPortalApi.getParticipantInterviews(),
        organizationId ? clientPortalApi.getOrganizationInterviews(organizationId) : Promise.resolve({ success: false, data: { interviews: [] } }),
      ]);

      if (assignedResponse.success && assignedResponse.data) {
        setAssignedInterviews(assignedResponse.data.interviews || []);
      }

      if (allResponse.success && allResponse.data) {
        setAllInterviews(allResponse.data.interviews || []);
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentInterviews = activeTab === 'assigned' ? assignedInterviews : allInterviews;

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Scheduled Interviews</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assigned Interviews ({assignedInterviews.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Interviews ({allInterviews.length})
            </button>
          </nav>
        </div>

        {currentInterviews.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600">
              {activeTab === 'assigned' 
                ? 'No interviews assigned to you' 
                : 'No interviews found for your organization'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Candidate</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Department</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Scheduled At</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Platform</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Scheduled By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentInterviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {interview.job_title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {interview.candidate_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(interview as any).department_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {interview.durationMinutes || 60} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {interview.meeting_platform || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'completed' ? 'dashboard-badge-success' :
                          interview.status === 'confirmed' ? 'dashboard-badge-primary' :
                          interview.status === 'scheduled' ? 'dashboard-badge-default' :
                          'dashboard-badge-default'
                        }`}>
                          {interview.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(interview as any).scheduled_by_first_name && (interview as any).scheduled_by_last_name
                          ? `${(interview as any).scheduled_by_first_name} ${(interview as any).scheduled_by_last_name}`
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


