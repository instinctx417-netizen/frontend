'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi, JobRequest } from '@/lib/clientPortalApi';
import Link from 'next/link';
import { useDashboard } from '../layout';

export default function JobRequestsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { setSelectedJobRequestId } = useDashboard();
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const orgsResponse = await clientPortalApi.getOrganizations();
      if (orgsResponse.success && orgsResponse.data) {
        const orgs = orgsResponse.data.organizations;
        if (orgs.length > 0) {
          const firstOrg = orgs[0];
          setSelectedOrg(firstOrg);
          await loadJobRequests(firstOrg.organization_id || firstOrg.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadJobRequests = async (organizationId: number) => {
    try {
      const response = await clientPortalApi.getJobRequests(organizationId);
      if (response.success && response.data) {
        setJobRequests(response.data.jobRequests);
      }
    } catch (err: any) {
      console.error('Failed to load job requests:', err);
    }
  };

  const handleJobRequestClick = (jobRequestId: number) => {
    setSelectedJobRequestId(jobRequestId);
    router.push('/dashboard/job-requests/detail');
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Job Requests</h1>
            {selectedOrg && (
              <p className="text-sm text-gray-600 font-light mt-1">
                {selectedOrg.organization_name || selectedOrg.name}
              </p>
            )}
          </div>
          {selectedOrg && (
            <Link
              href="/dashboard/job-requests/new"
                className="dashboard-btn-primary px-6 py-2 rounded-md font-medium"
            >
              + New Job Request
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {jobRequests.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No job requests found</p>
            {selectedOrg && (
              <Link
                href="/dashboard/job-requests/new"
                className="dashboard-btn-primary inline-block px-6 py-2 rounded-md font-medium"
              >
                Create Job Request
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobRequests.map((jobRequest) => (
                    <tr key={jobRequest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {jobRequest.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {jobRequest.department_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {jobRequest.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          jobRequest.status === 'hired' ? 'dashboard-badge-success' :
                          jobRequest.status === 'candidates_delivered' ? 'dashboard-badge-primary' :
                          jobRequest.status === 'interviews_scheduled' ? 'dashboard-badge-secondary' :
                          'dashboard-badge-default'
                        }`}>
                          {jobRequest.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {jobRequest.candidateCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {jobRequest.created_at ? new Date(jobRequest.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleJobRequestClick(jobRequest.id)}
                          className="dashboard-btn-primary px-4 py-2 rounded-md font-medium"
                        >
                          View Details
                        </button>
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

