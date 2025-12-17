'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { hrApi, clientPortalApi, JobRequest } from '@/lib/clientPortalApi';
import { User } from '@/lib/api';
import Link from 'next/link';

interface CandidateUser extends User {
  fullName?: string;
  phone?: string;
  primaryFunction?: string;
  yearsExperience?: number | string;
  location?: string;
  linkedIn?: string;
}

export default function HRJobRequestsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobRequest, setSelectedJobRequest] = useState<JobRequest | null>(null);
  const [showJobRequestDetail, setShowJobRequestDetail] = useState(false);
  const hasLoadedRef = useRef(false);

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
      loadJobRequests();
    }
  }, [isAuthenticated, user]);

  const loadJobRequests = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getAssignedJobRequests();
      if (response.success && response.data) {
        setJobRequests(response.data.jobRequests);
      }
    } catch (error) {
      console.error('Error loading job requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobRequestClick = async (jobRequestId: number) => {
    try {
      const response = await clientPortalApi.getJobRequest(jobRequestId);
      if (response.success && response.data) {
        setSelectedJobRequest(response.data.jobRequest);
        setShowJobRequestDetail(true);
      }
    } catch (error) {
      console.error('Error loading job request:', error);
      alert('Failed to load job request details');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Assigned Job Requests</h1>
        </div>

        {jobRequests.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600">No job requests assigned to you yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Title</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Organization</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Department</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Created</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobRequests.map((jobRequest) => (
                    <tr key={jobRequest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {jobRequest.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(jobRequest as any).organization_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {jobRequest.department_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          jobRequest.status === 'candidates_delivered' ? 'dashboard-badge-success' :
                          jobRequest.status === 'assigned_to_hr' ? 'dashboard-badge-primary' :
                          'dashboard-badge-default'
                        }`}>
                          {jobRequest.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {jobRequest.created_at ? new Date(jobRequest.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleJobRequestClick(jobRequest.id)}
                          className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
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

        {/* Job Request Detail Modal */}
        {showJobRequestDetail && selectedJobRequest && (
          <JobRequestDetailModal
            jobRequest={selectedJobRequest}
            onClose={() => {
              setShowJobRequestDetail(false);
              setSelectedJobRequest(null);
            }}
            onUpdate={loadJobRequests}
          />
        )}
      </div>
    </div>
  );
}

function JobRequestDetailModal({ 
  jobRequest: initialJobRequest, 
  onClose, 
  onUpdate 
}: { 
  jobRequest: JobRequest; 
  onClose: () => void; 
  onUpdate: () => void;
}) {
  const [jobRequest, setJobRequest] = useState<JobRequest>(initialJobRequest);
  const [candidates, setCandidates] = useState(initialJobRequest.candidates || []);
  const [loading, setLoading] = useState(false);
  const [showPushCandidates, setShowPushCandidates] = useState(false);

  const loadJobRequest = async () => {
    try {
      setLoading(true);
      const response = await clientPortalApi.getJobRequest(jobRequest.id);
      if (response.success && response.data) {
        const jr = response.data.jobRequest;
        setJobRequest(jr);
        setCandidates(jr.candidates || []);
      }
    } catch (error) {
      console.error('Error loading job request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">{jobRequest.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Job Request Info */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Organization</p>
              <p className="font-medium text-black">{jobRequest.organization_name || 'N/A'}</p>
            </div>
            {jobRequest.departmentName && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Department</p>
                <p className="font-medium text-black">{jobRequest.departmentName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                jobRequest.status === 'candidates_delivered' ? 'dashboard-badge-success' :
                jobRequest.status === 'assigned_to_hr' ? 'dashboard-badge-primary' :
                'dashboard-badge-default'
              }`}>
                {jobRequest.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Priority</p>
              <p className="font-medium text-black capitalize">{jobRequest.priority}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Job Description</p>
            <p className="text-gray-800 whitespace-pre-wrap">{jobRequest.jobDescription}</p>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-black">Candidates ({candidates.length})</h3>
            {(jobRequest.status === 'assigned_to_hr' || jobRequest.status === 'candidates_delivered') && (
              <button
                onClick={() => setShowPushCandidates(true)}
                className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
              >
                + Push Candidates
              </button>
            )}
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No candidates pushed yet</p>
              {(jobRequest.status === 'assigned_to_hr' || jobRequest.status === 'candidates_delivered') && (
                <button
                  onClick={() => setShowPushCandidates(true)}
                  className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
                >
                  Push First Candidates
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Name</th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Email</th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{candidate.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{candidate.email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{candidate.phone || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          candidate.status === 'delivered' ? 'dashboard-badge-primary' :
                          candidate.status === 'viewed' ? 'dashboard-badge-warning' :
                          candidate.status === 'selected' ? 'dashboard-badge-success' :
                          'dashboard-badge-default'
                        }`}>
                          {candidate.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Push Candidates Modal */}
        {showPushCandidates && (
          <PushCandidatesModal
            jobRequestId={jobRequest.id}
            onClose={() => {
              setShowPushCandidates(false);
              loadJobRequest();
              onUpdate();
              // Close the job request details modal after successful push
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

function PushCandidatesModal({ jobRequestId, onClose }: { jobRequestId: number; onClose: () => void }) {
  const [candidateUsers, setCandidateUsers] = useState<any[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCandidateUsers();
  }, []);

  const loadCandidateUsers = async () => {
    try {
      setLoadingCandidates(true);
      const response = await hrApi.getCandidateUsers();
      if (response.success && response.data) {
        setCandidateUsers(response.data.candidates || []);
      }
    } catch (err: any) {
      console.error('Error loading candidate users:', err);
      setError('Failed to load candidate users');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleToggleCandidate = (candidateId: number) => {
    setSelectedCandidateIds(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        if (prev.length >= 5) {
          setError('Maximum 5 candidates can be selected');
          return prev;
        }
        setError('');
        return [...prev, candidateId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedCandidateIds.length === 0) {
      setError('Please select at least one candidate');
      return;
    }

    if (selectedCandidateIds.length > 5) {
      setError('Maximum 5 candidates allowed');
      return;
    }

    setLoading(true);
    try {
      const response = await hrApi.pushCandidates(jobRequestId, selectedCandidateIds);
      if (response.success) {
        onClose();
      } else {
        setError(response.message || 'Failed to push candidates');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to push candidates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-black mb-6">Select Candidates (Up to 5)</h2>

        {loadingCandidates ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        ) : candidateUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No registered candidates found</p>
            <p className="text-sm text-gray-500">Candidates need to register first before they can be assigned to job requests.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Selected: {selectedCandidateIds.length} / 5
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto sidebar-scroll">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={candidateUsers.length > 0 && selectedCandidateIds.length === Math.min(candidateUsers.length, 5)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const ids = candidateUsers.slice(0, 5).map(c => c.id);
                              setSelectedCandidateIds(ids);
                            } else {
                              setSelectedCandidateIds([]);
                            }
                          }}
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Name</th>
                      <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Email</th>
                      <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Function</th>
                      <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Experience</th>
                      <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidateUsers.map((candidate) => {
                      const isSelected = selectedCandidateIds.includes(candidate.id);
                      return (
                        <tr
                          key={candidate.id}
                          onClick={() => handleToggleCandidate(candidate.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-gray-50 hover:bg-gray-100'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleCandidate(candidate.id)}
                              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-black">
                              {candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{candidate.email}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{candidate.phone || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{candidate.primaryFunction || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {candidate.yearsExperience ? `${candidate.yearsExperience} years` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{candidate.location || 'N/A'}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedCandidateIds.length === 0}
                className="flex-1 px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md disabled:opacity-50"
              >
                {loading ? 'Pushing Candidates...' : `Push ${selectedCandidateIds.length} Candidate${selectedCandidateIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

