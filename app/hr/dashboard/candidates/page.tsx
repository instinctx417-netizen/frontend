'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { hrApi } from '@/lib/clientPortalApi';
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

export default function HRCandidatesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateUser | null>(null);
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
      loadCandidates();
    }
  }, [isAuthenticated, user]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getCandidateUsers();
      if (response.success && response.data) {
        setCandidates(response.data.candidates || []);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-black">Candidates</h1>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No registered candidates found</p>
            <p className="text-sm text-gray-500">Candidates need to register first before they can be assigned to job requests.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Name</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Email</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Function</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Experience</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Location</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.primaryFunction || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {candidate.yearsExperience ? `${candidate.yearsExperience} years` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{candidate.location || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {candidate.linkedIn && (
                            <a
                              href={candidate.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
                            >
                              LinkedIn
                            </a>
                          )}
                          <button 
                            onClick={() => setSelectedCandidate(candidate)}
                            className="px-4 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
                          >
                            View Details
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

        {/* Candidate Details Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-black">Candidate Details</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-600 hover:text-black transition-colors"
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
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-base text-black font-medium">
                      {selectedCandidate.fullName || `${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-base text-black">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-base text-black">{selectedCandidate.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Primary Function</label>
                    <p className="text-base text-black">{selectedCandidate.primaryFunction || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Years of Experience</label>
                    <p className="text-base text-black">
                      {selectedCandidate.yearsExperience ? `${selectedCandidate.yearsExperience} years` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <p className="text-base text-black">{selectedCandidate.location || 'N/A'}</p>
                  </div>
                  {selectedCandidate.linkedIn && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">LinkedIn</label>
                      <a
                        href={selectedCandidate.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:underline"
                      >
                        {selectedCandidate.linkedIn}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

