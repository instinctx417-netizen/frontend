'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi } from '@/lib/clientPortalApi';
import { useToast } from '@/contexts/ToastContext';

interface Requirement {
  id: number;
  title: string;
  description?: string;
  is_required: boolean;
  display_order: number;
}

interface Submission {
  id: number;
  requirement_id: number;
  file_url: string;
  file_name: string;
  file_size?: number;
  submitted_at: string;
  requirement_title: string;
  requirement_description?: string;
  is_required: boolean;
}

const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL || '';

function buildFileUrl(key: string): string {
  if (!key) return '';
  if (!S3_BASE_URL) return key;
  const base = S3_BASE_URL.replace(/\/$/, '');
  return `${base}/${key}`;
}

function getFileTypeFromKey(key: string): 'image' | 'pdf' | 'other' {
  const ext = key.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  if (['png', 'jpg', 'jpeg', 'tif', 'tiff'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

export default function OnboardingPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [fileModal, setFileModal] = useState<{
    open: boolean;
    url: string;
    name: string;
    type: 'image' | 'pdf' | 'other';
  }>({ open: false, url: '', name: '', type: 'other' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType !== 'candidate') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.userType === 'candidate') {
      loadRequirements();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientPortalApi.getOnboardingRequirements();
      if (response.success && response.data) {
        setRequirements(response.data.requirements || []);
        
        // Map submissions by requirement_id
        const submissionsMap: Record<number, Submission> = {};
        (response.data.submissions || []).forEach((submission: Submission) => {
          submissionsMap[submission.requirement_id] = submission;
        });
        setSubmissions(submissionsMap);
      } else {
        setError(response.message || 'Failed to load requirements');
      }
    } catch (error: any) {
      console.error('Error loading requirements:', error);
      setError(error.message || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (requirementId: number, file: File | null) => {
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast('File size exceeds 10MB limit', 'error');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/tiff', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file type. Only images and PDFs are allowed', 'error');
      return;
    }

    setUploading(prev => ({ ...prev, [requirementId]: true }));
    try {
      const response = await clientPortalApi.submitOnboardingFile(requirementId, file);
      if (response.success) {
        showToast('File uploaded successfully', 'success');
        loadRequirements();
      } else {
        showToast(response.message || 'Failed to upload file', 'error');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showToast(error.message || 'Failed to upload file', 'error');
    } finally {
      setUploading(prev => ({ ...prev, [requirementId]: false }));
      // Reset file input
      if (fileInputRefs.current[requirementId]) {
        fileInputRefs.current[requirementId]!.value = '';
      }
    }
  };


  if (loading || authLoading) {
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
        <h1 className="text-3xl font-bold text-black mb-8">Onboarding</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {requirements.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-2">No onboarding requirements yet.</p>
            <p className="text-sm text-gray-500">Your administrator will set up the required documents.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((requirement) => {
              const submission = submissions[requirement.id];
              const isUploading = uploading[requirement.id];

              return (
                <div key={requirement.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-black">{requirement.title}</h3>
                      {requirement.is_required && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                    {requirement.description && (
                      <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                    )}
                  </div>

                  {submission ? (
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-black">{submission.file_name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(submission.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const fileUrl = buildFileUrl(submission.file_url);
                            if (fileUrl) {
                              setFileModal({
                                open: true,
                                url: fileUrl,
                                name: submission.file_name,
                                type: getFileTypeFromKey(submission.file_url)
                              });
                            }
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={(el) => { fileInputRefs.current[requirement.id] = el; }}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            handleFileChange(requirement.id, file);
                          }
                        }}
                        className="hidden"
                        id={`file-input-${requirement.id}`}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor={`file-input-${requirement.id}`}
                        className={`inline-block px-4 py-2 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                          isUploading
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {isUploading ? (
                          <span className="text-sm text-gray-600">Uploading...</span>
                        ) : (
                          <span className="text-sm text-gray-700">Click to upload or drag and drop</span>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, TIFF, or PDF (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                onClick={() => setFileModal({ open: false, url: '', name: '', type: 'other' })}
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
                onClick={() => setFileModal({ open: false, url: '', name: '', type: 'other' })}
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
