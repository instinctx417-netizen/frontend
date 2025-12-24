'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clientPortalApi, adminApi } from '@/lib/clientPortalApi';
import { User } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface CandidateDetailPageProps {
  backHref: string;
}

type FileItem = {
  key: string;
  label: string;
  type: 'image' | 'pdf' | 'other';
  role: 'cv' | 'attachment';
};

const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL || '';

function buildFileUrl(key: string): string {
  if (!key) return '';
  if (!S3_BASE_URL) return key;
  const base = S3_BASE_URL.replace(/\/$/, '');
  return `${base}/${key}`;
}

function getFileTypeFromKey(key: string): FileItem['type'] {
  const ext = key.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  if (['png', 'jpg', 'jpeg', 'tif', 'tiff'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

export default function CandidateDetailPage({ backHref }: CandidateDetailPageProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [candidate, setCandidate] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizStats, setQuizStats] = useState<{ total_answered: number; correct_answers: number; outdated_answers: number } | null>(null);
  const [onboardingSubmissions, setOnboardingSubmissions] = useState<any[]>([]);
  const [loadingQuizStats, setLoadingQuizStats] = useState(false);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [deletingSubmission, setDeletingSubmission] = useState<number | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ show: boolean; submissionId: number; fileName: string } | null>(null);
  const { showToast } = useToast();
  const [fileModal, setFileModal] = useState<{
    open: boolean;
    url: string;
    name: string;
    type: FileItem['type'];
  }>({ open: false, url: '', name: '', type: 'other' });

  const candidateId = Number(searchParams.get('id'));

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!user || (user.userType !== 'admin' && user.userType !== 'hr' && user.userType !== 'client')) {
      router.push('/dashboard');
      return;
    }
    if (!candidateId || Number.isNaN(candidateId)) {
      setError('Invalid candidate ID');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await clientPortalApi.getCandidateUserDetails(candidateId);
        if (response.success && response.data) {
          setCandidate(response.data.candidate);
          
          // If admin viewing a staff member, load quiz stats and onboarding docs
          if (user?.userType === 'admin' && response.data.candidate.userType === 'candidate') {
            loadQuizStats(candidateId);
            loadOnboardingDocs(candidateId);
          }
        } else {
          setError(response.message || 'Failed to load candidate');
        }
      } catch (err: any) {
        console.error('Error loading candidate details:', err);
        setError(err.message || 'Failed to load candidate');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [candidateId, isAuthenticated, user]);

  const loadQuizStats = async (userId: number) => {
    try {
      setLoadingQuizStats(true);
      const response = await clientPortalApi.getQuizStats(userId);
      if (response.success && response.data) {
        setQuizStats(response.data.stats);
      }
    } catch (err: any) {
      console.error('Error loading quiz stats:', err);
    } finally {
      setLoadingQuizStats(false);
    }
  };

  const loadOnboardingDocs = async (userId: number) => {
    try {
      setLoadingOnboarding(true);
      const response = await clientPortalApi.getOnboardingRequirements(userId);
      console.log('Onboarding docs response:', response);
      if (response.success && response.data) {
        console.log('Onboarding submissions:', response.data.submissions);
        setOnboardingSubmissions(response.data.submissions || []);
      } else {
        console.error('Failed to load onboarding docs:', response.message);
      }
    } catch (err: any) {
      console.error('Error loading onboarding docs:', err);
    } finally {
      setLoadingOnboarding(false);
    }
  };

  const handleDeleteSubmission = (submissionId: number, fileName: string) => {
    setDeleteConfirmModal({ show: true, submissionId, fileName });
  };

  const confirmDeleteSubmission = async () => {
    if (!deleteConfirmModal) return;

    try {
      setDeletingSubmission(deleteConfirmModal.submissionId);
      const response = await adminApi.deleteOnboardingSubmission(deleteConfirmModal.submissionId);
      if (response.success) {
        showToast('Onboarding document deleted successfully', 'success');
        setDeleteConfirmModal(null);
        // Reload onboarding docs
        if (candidateId) {
          await loadOnboardingDocs(candidateId);
        }
      } else {
        showToast(response.message || 'Failed to delete document', 'error');
      }
    } catch (err: any) {
      console.error('Error deleting submission:', err);
      showToast(err.message || 'Failed to delete document', 'error');
    } finally {
      setDeletingSubmission(null);
    }
  };

  const openFileModal = (item: FileItem) => {
    const url = buildFileUrl(item.key);
    if (!url) return;
    setFileModal({
      open: true,
      url,
      name: item.label,
      type: item.type,
    });
  };

  const closeFileModal = () => {
    setFileModal(prev => ({ ...prev, open: false }));
  };

  const fileItems: FileItem[] = [];
  if (candidate?.resumePath) {
    const resumeKey = candidate.resumePath;
    const resumeFileName = resumeKey.split('/').pop() || 'resume';
    const resumeExt = resumeFileName.includes('.') ? `.${resumeFileName.split('.').pop()}` : '';
    const resumeBase = resumeFileName.replace(/\.[^/.]+$/, '').split('-').slice(0, -1).join('-') || 'resume';
    fileItems.push({
      key: resumeKey,
      label: `${resumeBase}${resumeExt || ''}`,
      type: getFileTypeFromKey(resumeKey),
      role: 'cv',
    });
  }
  if (Array.isArray(candidate?.candidateDocuments)) {
    for (const key of candidate.candidateDocuments as any[]) {
      if (!key) continue;
      const strKey = typeof key === 'string' ? key : '';
      const fileName = strKey.split('/').pop() || 'Document';
      const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';
      const base =
        fileName
          .replace(/\.[^/.]+$/, '')
          .split('-')
          .slice(0, -1)
          .join('-') || 'Document';
      fileItems.push({
        key: strKey,
        label: `${base}${ext || ''}`,
        type: getFileTypeFromKey(strKey),
        role: 'attachment',
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push(backHref)}
            className="mb-6 text-sm text-gray-600 hover:text-black"
          >
            ← Back to candidates
          </button>
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h1 className="text-2xl font-bold text-black mb-4">Candidate Profile</h1>
            <p className="text-red-600 text-sm">{error || 'Candidate not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const profileImageUrl = candidate.profilePicPath ? buildFileUrl(candidate.profilePicPath) : null;
  const displayName = candidate.fullName || `${candidate.firstName} ${candidate.lastName}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            {/* Hide back button for client users */}
            {user?.userType !== 'client' && (
              <button
                onClick={() => router.push(backHref)}
                className="mb-3 text-xs text-gray-500 hover:text-black"
              >
                ← Back to candidates
              </button>
            )}
            <h1 className="text-3xl font-bold text-black">Candidate Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Detailed application overview for {displayName}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-gray-600">
                  {displayName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="mt-3 text-xs uppercase tracking-wide text-gray-500">
              {candidate.primaryFunction || 'Candidate'}
            </span>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Personal Information
            </h2>
            <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Full Name</div>
                <div className="font-medium text-black">{displayName}</div>
              </div>
              {/* Hide email and phone for client users */}
              {user?.userType !== 'client' && (
                <>
                  <div>
                    <div className="text-gray-500 mb-1">Email</div>
                    <div className="font-medium text-black">{candidate.email}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Phone</div>
                    <div className="font-medium text-black">{candidate.phone || 'N/A'}</div>
                  </div>
                </>
              )}
              <div>
                <div className="text-gray-500 mb-1">Location</div>
                <div className="font-medium text-black">
                  {candidate.location || candidate.country || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Timezone</div>
                <div className="font-medium text-black">{candidate.timezone || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Availability</div>
                <div className="font-medium text-black">{candidate.availability || 'N/A'}</div>
              </div>
            </div>
          </section>

          {/* Professional Info */}
          <section>
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Professional Background
            </h2>
            <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Primary Function</div>
                <div className="font-medium text-black">{candidate.primaryFunction || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Years of Experience</div>
                <div className="font-medium text-black">
                  {candidate.yearsExperience ? `${candidate.yearsExperience} years` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Current / Recent Role</div>
                <div className="font-medium text-black">{candidate.currentRole || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Highest Education</div>
                <div className="font-medium text-black">{candidate.education || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">English Proficiency</div>
                <div className="font-medium text-black">{candidate.englishProficiency || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">LinkedIn</div>
                {candidate.linkedIn ? (
                  <a
                    href={candidate.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline break-all"
                  >
                    {candidate.linkedIn}
                  </a>
                ) : (
                  <div className="font-medium text-black">N/A</div>
                )}
              </div>
              <div>
                <div className="text-gray-500 mb-1">Portfolio / Website</div>
                {candidate.portfolio ? (
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline break-all"
                  >
                    {candidate.portfolio}
                  </a>
                ) : (
                  <div className="font-medium text-black">N/A</div>
                )}
              </div>
            </div>
          </section>

          {/* Narrative Sections */}
          <section>
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              About & Experience
            </h2>
            <div className="mt-4 space-y-6 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Why InstinctX</div>
                <div className="whitespace-pre-line text-gray-800">
                  {candidate.whyInstinctX || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Startup Experience</div>
                <div className="whitespace-pre-line text-gray-800">
                  {candidate.startupExperience || 'N/A'}
                </div>
              </div>
            </div>
          </section>

          {/* Files */}
          <section>
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Documents
            </h2>
            {fileItems.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No documents uploaded.</p>
            ) : (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {fileItems.map((item, idx) => {
                  const label = item.label;
                  const isCv = item.role === 'cv';
                  const isPdf = item.type === 'pdf';
                  const isImage = item.type === 'image';
                  const iconColor = isPdf ? 'text-red-600' : isImage ? 'text-blue-600' : 'text-gray-700';

                  return (
                    <button
                      key={`${item.key}-${idx}`}
                      type="button"
                      onClick={() => openFileModal(item)}
                      className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-md hover:border-black hover:bg-gray-50 text-left cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-12 h-12 flex items-center justify-center rounded-md bg-gray-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className={`w-6 h-6 ${iconColor}`}
                          >
                            <path
                              d="M6 2h7l5 5v15H6z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M13 2v5h5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {isImage && (
                              <>
                                <path
                                  d="M8 16l2.5-3 2.5 3 2-2.5L18 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="9"
                                  cy="11"
                                  r="0.8"
                                  fill="currentColor"
                                />
                              </>
                            )}
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-500">
                            {isCv ? 'CV / Resume' : 'Other Attachment'}
                          </div>
                          <div className="text-sm font-medium text-black truncate">
                            {label}
                          </div>
                        </div>
                      </div>
                      <span className="ml-3 text-xs text-gray-500">View</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quiz Summary - Only for admin viewing staff */}
          {user?.userType === 'admin' && candidate?.userType === 'candidate' && (
            <section>
              <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                Training Quiz Summary
              </h2>
              {loadingQuizStats ? (
                <div className="mt-4 text-sm text-gray-500">Loading quiz stats...</div>
              ) : quizStats ? (
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Total Answered</div>
                    <div className="text-2xl font-bold text-black">{quizStats.total_answered || 0}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Correct Answers</div>
                    <div className="text-2xl font-bold text-green-700">{quizStats.correct_answers || 0}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Outdated Answers</div>
                    <div className="text-2xl font-bold text-yellow-700">{quizStats.outdated_answers || 0}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">No quiz data available</div>
              )}
            </section>
          )}

          {/* Onboarding Documents - Only for admin viewing staff */}
          {user?.userType === 'admin' && candidate?.userType === 'candidate' && (
            <section>
              <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                Onboarding Documents
              </h2>
              {loadingOnboarding ? (
                <div className="mt-4 text-sm text-gray-500">Loading documents...</div>
              ) : onboardingSubmissions.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {onboardingSubmissions.map((submission) => {
                    const fileUrl = buildFileUrl(submission.file_url);
                    const fileType = getFileTypeFromKey(submission.file_url);
                    return (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-black">{submission.requirement_title}</div>
                          {submission.requirement_description && (
                            <div className="text-xs text-gray-500 mt-1">{submission.requirement_description}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {submission.file_name} • {submission.file_size ? `${(submission.file_size / 1024).toFixed(1)} KB` : ''}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {fileUrl && (
                            <button
                              onClick={() => openFileModal({
                                key: submission.file_url,
                                label: submission.file_name,
                                type: fileType,
                                role: 'attachment'
                              })}
                              className="px-3 py-1 text-xs dashboard-btn-primary font-medium rounded cursor-pointer"
                            >
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSubmission(submission.id, submission.file_name)}
                            disabled={deletingSubmission === submission.id}
                            className="px-3 py-1 text-xs border border-red-300 rounded text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {deletingSubmission === submission.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">No onboarding documents submitted</div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-black mb-4">Delete Onboarding Document</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{deleteConfirmModal.fileName}</strong>?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSubmission}
                disabled={deletingSubmission === deleteConfirmModal.submissionId}
                className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingSubmission === deleteConfirmModal.submissionId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File preview modal */}
      {fileModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-black">File Preview</h3>
                <p className="text-xs text-gray-500 truncate">{fileModal.name}</p>
              </div>
              <button
                type="button"
                onClick={closeFileModal}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              {fileModal.type === 'image' ? (
                <img
                  src={fileModal.url}
                  alt={fileModal.name}
                  className="max-h-[80vh] max-w-full object-contain"
                />
              ) : fileModal.type === 'pdf' ? (
                <iframe
                  src={fileModal.url}
                  title={fileModal.name}
                  className="w-full h-[80vh] border-0"
                />
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    This file type cannot be previewed. You can open it in a new tab.
                  </p>
                  <a
                    href={fileModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={closeFileModal}
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


