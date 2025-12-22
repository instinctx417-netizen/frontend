'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { clientPortalApi, JobRequest, Candidate } from '@/lib/clientPortalApi';
import Link from 'next/link';
import { useDashboard } from '../../layout';

export default function NewInterviewPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedJobRequestId, setSelectedJobRequestId } = useDashboard();
  
  // Get job request ID from URL query params or context
  const jobRequestIdFromUrl = searchParams.get('jobRequestId');
  const jobRequestId = jobRequestIdFromUrl ? parseInt(jobRequestIdFromUrl) : selectedJobRequestId;

  const [selectedJobRequest, setSelectedJobRequest] = useState<JobRequest | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<Array<{ id: number; email: string; firstName: string; lastName: string; role: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobRequest, setLoadingJobRequest] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  const [formData, setFormData] = useState({
    jobRequestId: jobRequestId ? jobRequestId.toString() : '',
    candidateId: '',
    scheduledAt: '',
    durationMinutes: 60,
    meetingLink: '',
    meetingPlatform: 'zoom',
    notes: '',
    participantUserIds: [] as number[],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client' && jobRequestId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [isAuthenticated, authLoading, user, jobRequestId]);

  const loadData = async () => {
    try {
      setLoadingJobRequest(true);
      if (jobRequestId) {
        await loadJobRequest(jobRequestId);
      } else {
        setError('Job request ID is required. Please navigate from a job request page.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoadingJobRequest(false);
    }
  };

  const loadJobRequest = async (id: number) => {
    try {
      const response = await clientPortalApi.getJobRequest(id);
      if (response.success && response.data) {
        const jr = response.data.jobRequest;
        setSelectedJobRequest(jr);
        setCandidates(jr.candidates || []);
        setFormData(prev => ({ ...prev, jobRequestId: id.toString() }));
        // Load organization users for participant selection
        // Handle both camelCase and snake_case field names
        const orgId = jr.organizationId || (jr as any).organization_id;
        if (orgId) {
          console.log('Loading organization users for organizationId:', orgId);
          await loadOrganizationUsers(orgId);
        } else {
          console.warn('No organization ID found in job request:', jr);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job request');
    }
  };

  const loadOrganizationUsers = async (organizationId: number) => {
    try {
      setLoadingUsers(true);
      console.log('Calling getOrganizationUsers with organizationId:', organizationId);
      const response = await clientPortalApi.getOrganizationUsers(organizationId);
      console.log('getOrganizationUsers response:', response);
      if (response.success && response.data) {
        const users = response.data.users || [];
        console.log('Loaded organization users:', users);
        setOrganizationUsers(users);
      } else {
        console.error('Failed to load organization users - response not successful:', response);
    }
    } catch (err: any) {
      console.error('Failed to load organization users:', err);
      setError(`Failed to load team members: ${err.message || 'Unknown error'}`);
    } finally {
      setLoadingUsers(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await clientPortalApi.createInterview({
        jobRequestId: parseInt(formData.jobRequestId),
        candidateId: parseInt(formData.candidateId),
        scheduled_at: formData.scheduledAt,
        durationMinutes: formData.durationMinutes,
        meetingLink: formData.meetingLink || undefined,
        meetingPlatform: formData.meetingPlatform || undefined,
        notes: formData.notes || undefined,
        participantUserIds: formData.participantUserIds.length > 0 ? formData.participantUserIds : undefined,
      });

      if (response.success) {
        // Set the job request ID in context and navigate to detail page
        if (jobRequestId) {
          setSelectedJobRequestId(jobRequestId);
          router.push('/dashboard/job-requests/detail');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.message || 'Failed to schedule interview');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loadingJobRequest) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <button
          onClick={() => {
            if (jobRequestId) {
              setSelectedJobRequestId(jobRequestId);
              router.push('/dashboard/job-requests/detail');
            } else {
              router.push('/dashboard');
            }
          }}
          className="flex items-center text-gray-600 hover:text-black mb-8 font-light transition-colors"
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
            className="w-5 h-5 mr-2"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-black mb-2">Schedule Interview</h1>
          <p className="text-gray-600 font-light mb-8">
            Schedule an interview with a candidate and invite team members
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!selectedJobRequest ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Please select a job request first</p>
              <Link
                href="/dashboard"
                className="dashboard-btn-primary inline-block px-6 py-2 rounded-md font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {selectedJobRequest && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Job Request</p>
                  <p className="text-base font-medium text-black">{selectedJobRequest.title}</p>
                  {selectedJobRequest.departmentName && (
                    <p className="text-sm text-gray-500 mt-1">Department: {selectedJobRequest.departmentName}</p>
                  )}
                </div>
              )}

                <div>
                  <label htmlFor="candidateId" className="block text-sm font-medium text-black mb-2">
                    Candidate *
                  </label>
                  <select
                    id="candidateId"
                    required
                    value={formData.candidateId}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidateId: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    <option value="">Select candidate</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="scheduledAt" className="block text-sm font-medium text-black mb-2">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledAt"
                      required
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      className="h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="durationMinutes" className="block text-sm font-medium text-black mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="durationMinutes"
                      min="15"
                      step="15"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="meetingPlatform" className="block text-sm font-medium text-black mb-2">
                      Meeting Platform
                    </label>
                    <select
                      id="meetingPlatform"
                      value={formData.meetingPlatform}
                      onChange={(e) => setFormData(prev => ({ ...prev, meetingPlatform: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      <option value="zoom">Zoom</option>
                      <option value="google_meet">Google Meet</option>
                      <option value="teams">Microsoft Teams</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="meetingLink" className="block text-sm font-medium text-black mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      id="meetingLink"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                      placeholder="https://..."
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-black mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    placeholder="Additional notes or agenda items..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Invite Team Members (Optional)
                  </label>
                  <p className="text-sm text-gray-600 mb-4 font-light">
                    Select team members to invite to this interview
                  </p>
                  {loadingUsers ? (
                    <p className="text-sm text-gray-500">Loading team members...</p>
                  ) : organizationUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No team members found in this organization</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
                      {organizationUsers.map((user) => {
                        const isSelected = formData.participantUserIds.includes(user.id);
                        return (
                          <label
                            key={user.id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    participantUserIds: [...prev.participantUserIds, user.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    participantUserIds: prev.participantUserIds.filter(id => id !== user.id)
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-black">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email} {user.role && `• ${user.role.replace(/_/g, ' ')}`}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !selectedJobRequest}
                className="dashboard-btn-primary px-8 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
              <button
                onClick={() => {
                  if (jobRequestId) {
                    setSelectedJobRequestId(jobRequestId);
                    router.push('/dashboard/job-requests/detail');
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="px-8 py-3 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </main>
  );
}

