'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi, hrApi, clientPortalApi, HRUser, JobRequest } from '@/lib/clientPortalApi';
import { User } from '@/lib/api';

export default function AdminJobRequestsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignHR, setShowAssignHR] = useState<{ jobRequestId: number } | null>(null);
  const [selectedJobRequest, setSelectedJobRequest] = useState<JobRequest | null>(null);
  const [showJobRequestDetail, setShowJobRequestDetail] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobRequestsResponse, hrResponse] = await Promise.all([
        adminApi.getAllJobRequests(),
        adminApi.getHRUsers(),
      ]);

      if (jobRequestsResponse.success && jobRequestsResponse.data) {
        setJobRequests(jobRequestsResponse.data.jobRequests);
      }

      if (hrResponse.success && hrResponse.data) {
        setHrUsers(hrResponse.data.users);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
          <h1 className="text-3xl font-bold text-black">Job Requests</h1>
        </div>

        {jobRequests.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600">No job requests found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                        {(jobRequest as any).organizationName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {jobRequest.departmentName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(jobRequest as any).requestedByFirstName} {(jobRequest as any).requestedByLastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {jobRequest.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {jobRequest.createdAt ? new Date(jobRequest.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {jobRequest.assignedToHrUserId ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Assigned to {(jobRequest as any).assignedHrFirstName}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Pending Assignment
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleJobRequestClick(jobRequest.id)}
                            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setShowAssignHR({ jobRequestId: jobRequest.id })}
                            className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md whitespace-nowrap min-w-[100px]"
                          >
                            {jobRequest.status === 'assigned_to_hr' || jobRequest.assignedToHrUserId ? 'Change HR' : 'Assign HR'}
                          </button>
                        </div>
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
            onUpdate={loadData}
          />
        )}

        {/* Assign/Change HR Modal */}
        {showAssignHR && (() => {
          const jobRequest = jobRequests.find(jr => jr.id === showAssignHR.jobRequestId);
          const isChanging = jobRequest?.status === 'assigned_to_hr' || !!jobRequest?.assignedToHrUserId;
          return (
            <AssignHRModal
              jobRequestId={showAssignHR.jobRequestId}
              hrUsers={hrUsers}
              isChanging={isChanging}
              onClose={() => {
                setShowAssignHR(null);
                loadData();
              }}
            />
          );
        })()}
      </div>
    </div>
  );
}

interface CandidateUser extends User {
  fullName?: string;
  phone?: string;
  primaryFunction?: string;
  yearsExperience?: number | string;
  location?: string;
  linkedIn?: string;
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
              <p className="font-medium text-black">{(jobRequest as any).organizationName || 'N/A'}</p>
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
                jobRequest.status === 'candidates_delivered' ? 'bg-green-100 text-green-800' :
                jobRequest.status === 'assigned_to_hr' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
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
            {(jobRequest.status === 'assigned_to_hr' || jobRequest.assignedToHrUserId) && (
              <button
                onClick={() => setShowPushCandidates(true)}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
              >
                + Push Candidates
              </button>
            )}
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No candidates pushed yet</p>
              {(jobRequest.status === 'assigned_to_hr' || jobRequest.assignedToHrUserId) && (
                <button
                  onClick={() => setShowPushCandidates(true)}
                  className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
                >
                  Push First Candidates
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                          candidate.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                          candidate.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                          candidate.status === 'selected' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
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
  const [candidateUsers, setCandidateUsers] = useState<CandidateUser[]>([]);
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

  const handleSelectAll = () => {
    if (selectedCandidateIds.length === candidateUsers.length) {
      setSelectedCandidateIds([]);
    } else {
      const maxSelect = Math.min(5, candidateUsers.length);
      setSelectedCandidateIds(candidateUsers.slice(0, maxSelect).map(c => c.id));
      if (candidateUsers.length > 5) {
        setError('Maximum 5 candidates can be selected');
      } else {
        setError('');
      }
    }
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Select Candidates (Up to 5)</h2>
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

        {loadingCandidates ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-black">
                  Select up to 5 candidates
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-black hover:underline"
                >
                  {selectedCandidateIds.length === candidateUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="overflow-x-auto sidebar-scroll border border-gray-200 rounded-lg">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCandidateIds.length === candidateUsers.length && candidateUsers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidateUsers.map((candidate) => {
                      const isSelected = selectedCandidateIds.includes(candidate.id);
                      const isDisabled = !isSelected && selectedCandidateIds.length >= 5;
                      return (
                        <tr 
                          key={candidate.id} 
                          className={`hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleCandidate(candidate.id)}
                              disabled={isDisabled}
                              className="rounded border-gray-300 text-black focus:ring-black"
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
                            <div className="text-sm text-gray-600">{candidate.yearsExperience || 'N/A'}</div>
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

              {candidateUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No candidates available</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {selectedCandidateIds.length} of {Math.min(5, candidateUsers.length)} selected
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedCandidateIds.length === 0}
                  className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md disabled:opacity-50"
                >
                  {loading ? 'Pushing...' : `Push ${selectedCandidateIds.length} Candidate${selectedCandidateIds.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AssignHRModal({ jobRequestId, hrUsers, onClose, isChanging = false }: { jobRequestId: number; hrUsers: HRUser[]; onClose: () => void; isChanging?: boolean }) {
  const [selectedHrUserId, setSelectedHrUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHrUserId) {
      setError('Please select an HR user');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await adminApi.assignHrToJobRequest(jobRequestId, parseInt(selectedHrUserId));
      if (response.success) {
        onClose();
      } else {
        setError(response.message || `Failed to ${isChanging ? 'change' : 'assign'} HR`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isChanging ? 'change' : 'assign'} HR`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-black mb-6">{isChanging ? 'Change HR Assignment' : 'Assign HR to Job Request'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select HR User *</label>
            <select
              required
              value={selectedHrUserId}
              onChange={(e) => setSelectedHrUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select HR user</option>
              {hrUsers.map((hrUser) => (
                <option key={hrUser.id} value={hrUser.id}>
                  {hrUser.firstName} {hrUser.lastName} ({hrUser.email})
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md disabled:opacity-50"
            >
              {loading ? (isChanging ? 'Changing...' : 'Assigning...') : (isChanging ? 'Change HR' : 'Assign HR')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

