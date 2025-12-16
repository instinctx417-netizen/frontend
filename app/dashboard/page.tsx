'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi, Organization, JobRequest } from '@/lib/clientPortalApi';
import Link from 'next/link';
import { useDashboard } from './layout';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { setSelectedJobRequestId } = useDashboard();
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client') {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        loadData();
      }
    }
  }, [isAuthenticated, authLoading, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const orgsResponse = await clientPortalApi.getOrganizations();
      if (orgsResponse.success && orgsResponse.data && orgsResponse.data.organizations.length > 0) {
        const firstOrg = orgsResponse.data.organizations[0];
        setSelectedOrg(firstOrg);
        loadJobRequests(firstOrg.organization_id || firstOrg.id);
        loadDepartments(firstOrg.organization_id || firstOrg.id);
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

  const loadDepartments = async (organizationId: number) => {
    try {
      const response = await clientPortalApi.getDepartments(organizationId);
      if (response.success && response.data) {
        setDepartments(response.data.departments);
      }
    } catch (err: any) {
      console.error('Failed to load departments:', err);
    }
  };


  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client') {
    return null;
  }

  const activeJobs = jobRequests.filter(jr => 
    ['received', 'assigned_to_hr', 'shortlisting', 'candidates_delivered'].includes(jr.status)
  ).length;
  const interviewsScheduled = jobRequests.filter(jr => jr.status === 'interviews_scheduled').length;
  const hired = jobRequests.filter(jr => jr.status === 'hired').length;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
                Dashboard
              </h1>
              {selectedOrg && (
                <p className="text-lg text-gray-600 font-light">
                  {selectedOrg.organization_name || selectedOrg.name}
                </p>
              )}
            </div>
            {selectedOrg && (
              <Link
                href="/dashboard/job-requests/new"
                className="inline-flex items-center px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors group"
              >
                New Job Request
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        {selectedOrg && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="bg-white border border-gray-200 rounded-lg p-8 hover:border-black transition-colors">
                <p className="text-sm text-gray-600 mb-3 font-light">Total Jobs</p>
                <p className="text-5xl font-bold text-black">{jobRequests.length}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-8 hover:border-black transition-colors">
                <p className="text-sm text-gray-600 mb-3 font-light">Active</p>
                <p className="text-5xl font-bold text-black">{activeJobs}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-8 hover:border-black transition-colors">
                <p className="text-sm text-gray-600 mb-3 font-light">Interviews</p>
                <p className="text-5xl font-bold text-black">{interviewsScheduled}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-8 hover:border-black transition-colors">
                <p className="text-sm text-gray-600 mb-3 font-light">Hired</p>
                <p className="text-5xl font-bold text-black">{hired}</p>
              </div>
            </div>


            {/* Departments List */}
            {selectedOrg && departments.length > 0 && (
              <div className="mb-12 bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black">Departments</h2>
                  <span className="text-sm text-gray-600">{departments.length} department{departments.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-4 border border-gray-200 rounded-md hover:border-black transition-colors">
                      <h3 className="font-semibold text-black mb-1">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-sm text-gray-600 font-light">{dept.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Requests Summary */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Job Requests</h2>
                <Link
                  href="/dashboard/job-requests"
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  View All →
                </Link>
              </div>
              {jobRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-1">No job requests yet</h3>
                  <p className="text-gray-600 font-light mb-4 text-sm">Create your first job request to start hiring</p>
                  <Link
                    href="/dashboard/job-requests/new"
                    className="inline-flex items-center px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors group"
                  >
                    Create Job Request
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {jobRequests.slice(0, 5).map((jobRequest) => (
                    <div
                      key={jobRequest.id}
                      onClick={() => {
                        setSelectedJobRequestId(jobRequest.id);
                        router.push('/dashboard/job-requests/detail');
                      }}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-black mb-2 group-hover:text-gray-700 transition-colors truncate">
                            {jobRequest.title}
                          </h3>
                          {jobRequest.departmentName && (
                            <p className="text-xs text-gray-600 mb-2 font-light">
                              {jobRequest.departmentName}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              jobRequest.status === 'hired' ? 'bg-green-50 text-green-700 border border-green-200' :
                              jobRequest.status === 'candidates_delivered' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              jobRequest.status === 'interviews_scheduled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}>
                              {jobRequest.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {jobRequest.candidateCount !== undefined && jobRequest.candidateCount > 0 && (
                              <span className="text-gray-600 font-light">{jobRequest.candidateCount} candidates</span>
                            )}
                            {jobRequest.interviewCount !== undefined && jobRequest.interviewCount > 0 && (
                              <span className="text-gray-600 font-light">{jobRequest.interviewCount} interviews</span>
                            )}
                          </div>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0 ml-2"
                        >
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </div>
                    </div>
                  ))}
                  {jobRequests.length > 5 && (
                    <div className="px-4 py-3 text-center border-t border-gray-200">
                      <Link
                        href="/dashboard/job-requests"
                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                      >
                        View all {jobRequests.length} job requests →
                    </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

