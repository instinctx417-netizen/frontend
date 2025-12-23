'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDashboard } from '@/app/dashboard/layout';
import { clientPortalApi, JobRequest, Candidate, Interview } from '@/lib/clientPortalApi';
import Link from 'next/link';

export default function JobRequestDetailClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedJobRequestId, setSelectedJobRequestId } = useDashboard();

  const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'candidates' | 'interviews'>('details');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showInterviewDetail, setShowInterviewDetail] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check for jobRequestId in URL query params first
    const jobRequestIdFromUrl = searchParams.get('jobRequestId');
    const jobRequestId = jobRequestIdFromUrl ? parseInt(jobRequestIdFromUrl) : selectedJobRequestId;

    if (isAuthenticated && user?.userType === 'client' && jobRequestId && !isNaN(jobRequestId) && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      if (jobRequestIdFromUrl) {
        setSelectedJobRequestId(jobRequestId);
      }
      loadJobRequest(jobRequestId);
    } else if (!jobRequestId) {
      // If no job request selected, redirect back to job requests
      router.push('/dashboard/job-requests');
    }
  }, [isAuthenticated, authLoading, user, selectedJobRequestId, searchParams]);

  const loadJobRequest = async (jobRequestId?: number) => {
    const idToLoad = jobRequestId || selectedJobRequestId;
    if (!idToLoad || isNaN(idToLoad)) {
      setError('Invalid job request ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await clientPortalApi.getJobRequest(idToLoad);
      if (response.success && response.data) {
        setJobRequest(response.data.jobRequest);
        setCandidates(response.data.jobRequest.candidates || []);
        setInterviews(response.data.jobRequest.interviews || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job request');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateStatusChange = async (candidateId: number, status: string) => {
    try {
      await clientPortalApi.updateCandidateStatus(candidateId, status);
      await loadJobRequest();
    } catch (err: any) {
      setError(err.message || 'Failed to update candidate status');
    }
  };

  const handleInterviewClick = async (interviewId: number) => {
    try {
      const response = await clientPortalApi.getInterview(interviewId);
      if (response.success && response.data) {
        setSelectedInterview(response.data.interview);
        setShowInterviewDetail(true);
      }
    } catch (err: any) {
      console.error('Error loading interview details:', err);
      setError(err.message || 'Failed to load interview details');
    }
  };

  const handleBack = () => {
    setSelectedJobRequestId(null);
    router.push('/dashboard/job-requests');
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client') {
    return null;
  }

  if (!selectedJobRequestId || isNaN(selectedJobRequestId)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No job request selected</p>
      </main>
    );
  }

  if (!jobRequest) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <button
          onClick={handleBack}
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
          Back to Job Requests
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-black mb-2">{jobRequest.title}</h1>
              {jobRequest.departmentName && (
                <p className="text-gray-600 mb-2">{jobRequest.departmentName}</p>
              )}
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                jobRequest.status === 'hired' ? 'dashboard-badge-success' :
                jobRequest.status === 'candidates_delivered' ? 'bg-blue-100 text-blue-800' :
                jobRequest.status === 'interviews_scheduled' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {jobRequest.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <Link
              href="/dashboard/interviews/new"
              className="px-6 py-3 dashboard-btn-primary font-medium transition-colors rounded-md"
            >
              Schedule Interview
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'candidates'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Candidates ({candidates.length})
              </button>
              <button
                onClick={() => setActiveTab('interviews')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'interviews'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Interviews ({interviews.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Job Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{jobRequest.jobDescription}</p>
                </div>
                {jobRequest.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Requirements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{jobRequest.requirements}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  {jobRequest.timelineToHire && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Timeline to Hire</h3>
                      <p className="text-black">{jobRequest.timelineToHire}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Priority</h3>
                    <p className="text-black capitalize">{jobRequest.priority}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'candidates' && (
              <div className="space-y-4">
                {candidates.length === 0 ? (
                  <p className="text-gray-600 text-center py-12">No candidates delivered yet</p>
                ) : (
                  candidates.map((candidate) => (
                    <div key={candidate.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-black">{candidate.name}</h3>
                        <div className="flex items-center gap-3">
                          {candidate.status !== 'hired' ? (
                            <select
                              value={candidate.status}
                              onChange={(e) => handleCandidateStatusChange(candidate.id, e.target.value)}
                              className="px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-black focus:outline-none focus:ring-2 focus:ring-black h-[42px]"
                            >
                              <option value="delivered">Delivered</option>
                              <option value="viewed">Viewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interview_scheduled">Interview Scheduled</option>
                              <option value="selected">Selected</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          ) : (
                            <span className="px-3 py-2 text-sm text-green-700 italic h-[42px] flex items-center font-medium">Hired</span>
                          )}
                          {candidate.userId && (
                            <a
                              href={`/dashboard/candidates/detail?id=${candidate.userId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md cursor-pointer inline-flex items-center gap-2"
                            >
                              <span>View Profile</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
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
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className="space-y-4">
                {interviews.length === 0 ? (
                  <p className="text-gray-600 text-center py-12">No interviews scheduled yet</p>
                ) : (
                  interviews.map((interview) => (
                    <div
                      key={interview.id}
                      onClick={() => handleInterviewClick(interview.id)}
                      className="border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-black hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-black">
                            {interview.candidate_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {interview.scheduled_at
                              ? new Date(interview.scheduled_at).toLocaleString()
                              : 'Date not set'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'completed' ? 'dashboard-badge-success' :
                          interview.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded-md mb-4"
                        >
                          Join Meeting
                        </a>
                      )}
                      {interview.participants && interview.participants.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">Participants:</p>
                          <div className="flex flex-wrap gap-2">
                            {interview.participants.map((p) => (
                              <span key={p.id} className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                                {p.firstName} {p.lastName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Interview Detail Modal */}
            {showInterviewDetail && selectedInterview && (
              <InterviewDetailModal
                interview={selectedInterview}
                onClose={() => {
                  setShowInterviewDetail(false);
                  setSelectedInterview(null);
                }}
              />
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

function InterviewDetailModal({ interview, onClose }: { interview: Interview; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Interview Details</h2>
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

        <div className="space-y-6">
          {/* Candidate Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Candidate</h3>
            <p className="text-lg font-semibold text-black">{interview.candidate_name}</p>
          </div>

          {/* Job Title */}
          {interview.job_title && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Job Position</h3>
              <p className="text-black">{interview.job_title}</p>
            </div>
          )}

          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Scheduled Date & Time</h3>
            <p className="text-black">
              {interview.scheduled_at
                ? new Date(interview.scheduled_at).toLocaleString()
                : 'Date not set'}
            </p>
            {interview.durationMinutes && (
              <p className="text-sm text-gray-600 mt-1">Duration: {interview.durationMinutes} minutes</p>
            )}
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              interview.status === 'completed' ? 'dashboard-badge-success' :
              interview.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
              interview.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
              interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {interview.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>

          {/* Meeting Platform & Link */}
          {interview.meeting_platform && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Meeting Platform</h3>
              <p className="text-black capitalize">{interview.meeting_platform.replace(/_/g, ' ')}</p>
            </div>
          )}

          {interview.meetingLink && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Meeting Link</h3>
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded-md"
              >
                Join Meeting
              </a>
            </div>
          )}

          {/* Participants */}
          {interview.participants && interview.participants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Participants</h3>
              <div className="space-y-2">
                {interview.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-black">
                        {participant.firstName} {participant.lastName}
                      </p>
                      {participant.email && (
                        <p className="text-sm text-gray-600">{participant.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 capitalize">{participant.role}</span>
                      {participant.confirmed ? (
                        <span className="px-2 py-1 dashboard-badge-success rounded-full text-xs font-medium">
                          Confirmed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {interview.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Notes</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{interview.notes}</p>
            </div>
          )}

          {/* Feedback */}
          {interview.feedback && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Feedback</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{interview.feedback}</p>
            </div>
          )}

          {/* Close Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


