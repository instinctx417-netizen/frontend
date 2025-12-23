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

    // Load data only for client users
    // Staff members (candidate userType) will see empty dashboard
    if (isAuthenticated && user?.userType === 'client') {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        loadData();
      }
    } else if (isAuthenticated && user?.userType === 'candidate') {
      // Staff members - set loading to false to show empty dashboard
      setLoading(false);
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


  // Show staff dashboard for staff members (candidate userType)
  if (isAuthenticated && user?.userType === 'candidate') {
    return (
      <main className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="dashboard-card rounded-lg p-6">
              <p className="text-sm mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>Onboarding Progress</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>--</p>
            </div>
            <div className="dashboard-card rounded-lg p-6">
              <p className="text-sm mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>Active Assignments</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>--</p>
            </div>
            <div className="dashboard-card rounded-lg p-6">
              <p className="text-sm mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>Training Completed</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>--</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dashboard-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/dashboard/onboarding" className="block p-3 rounded-md hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                  <span className="font-medium">Complete Onboarding</span>
                </Link>
                <Link href="/dashboard/training" className="block p-3 rounded-md hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                  <span className="font-medium">Start Training</span>
                </Link>
                <Link href="/dashboard/assignments" className="block p-3 rounded-md hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                  <span className="font-medium">View Assignments</span>
                </Link>
              </div>
            </div>
            
            <div className="dashboard-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Welcome</h2>
              <p className="font-light mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Welcome to your staff portal! Use the navigation menu to access onboarding, training modules, assignments, and your profile.
              </p>
              <Link href="/dashboard/profile" className="inline-block px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer">
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p className="font-light" style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
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
    <main className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Dashboard
              </h1>
              {selectedOrg && (
                <p className="text-lg font-light" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedOrg.organization_name || selectedOrg.name}
                </p>
              )}
            </div>
            {selectedOrg && (
              <Link
                href="/dashboard/job-requests/new"
                className="dashboard-btn-primary inline-flex items-center px-6 py-3 rounded-md font-medium group"
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
          <div className="mb-8 p-4 rounded-md" style={{ backgroundColor: 'var(--color-error-lightest)', border: '1px solid var(--color-error-lighter)' }}>
            <p className="text-sm" style={{ color: 'var(--color-error-dark)' }}>{error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        {selectedOrg && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="dashboard-card rounded-lg p-8">
                <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Total Jobs</p>
                <p className="text-5xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{jobRequests.length}</p>
              </div>
              <div className="dashboard-card rounded-lg p-8">
                <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Active</p>
                <p className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>{activeJobs}</p>
              </div>
              <div className="dashboard-card rounded-lg p-8">
                <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Interviews</p>
                <p className="text-5xl font-bold" style={{ color: 'var(--color-secondary)' }}>{interviewsScheduled}</p>
              </div>
              <div className="dashboard-card rounded-lg p-8">
                <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Hired</p>
                <p className="text-5xl font-bold" style={{ color: 'var(--color-success)' }}>{hired}</p>
              </div>
            </div>


            {/* Departments List */}
            {selectedOrg && departments.length > 0 && (
              <div className="mb-12 dashboard-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Departments</h2>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{departments.length} department{departments.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-4 rounded-md dashboard-card">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{dept.name}</h3>
                      {dept.description && (
                        <p className="text-sm font-light" style={{ color: 'var(--color-text-secondary)' }}>{dept.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Requests Summary */}
            <div className="dashboard-card rounded-lg overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Job Requests</h2>
                <Link
                  href="/dashboard/job-requests"
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
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
                    className="dashboard-btn-primary inline-flex items-center px-6 py-3 rounded-md font-medium group"
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
                      className="block px-4 py-3 transition-colors group cursor-pointer"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold mb-2 transition-colors truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {jobRequest.title}
                          </h3>
                          {jobRequest.departmentName && (
                            <p className="text-xs mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>
                              {jobRequest.departmentName}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              jobRequest.status === 'hired' ? 'dashboard-badge-success' :
                              jobRequest.status === 'candidates_delivered' ? 'dashboard-badge-primary' :
                              jobRequest.status === 'interviews_scheduled' ? 'dashboard-badge-secondary' :
                              'dashboard-badge-default'
                            }`}>
                              {jobRequest.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {jobRequest.candidateCount !== undefined && jobRequest.candidateCount > 0 && (
                              <span className="font-light" style={{ color: 'var(--color-text-secondary)' }}>{jobRequest.candidateCount} candidates</span>
                            )}
                            {jobRequest.interviewCount !== undefined && jobRequest.interviewCount > 0 && (
                              <span className="font-light" style={{ color: 'var(--color-text-secondary)' }}>{jobRequest.interviewCount} interviews</span>
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
                          className="w-4 h-4 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2"
                          style={{ color: 'var(--color-text-tertiary)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
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
                        className="text-sm font-medium transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
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

