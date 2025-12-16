'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ClientForm from '@/components/forms/ClientForm';
import CandidateForm from '@/components/forms/CandidateForm';

type ViewMode = 'selection' | 'client' | 'candidate';

export default function SignupPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleClientClick = () => {
    setViewMode('client');
  };

  const handleCandidateClick = () => {
    setViewMode('candidate');
  };

  const handleBack = () => {
    setViewMode('selection');
  };

  // Show forms when selected
  if (viewMode === 'client') {
    return <ClientForm onBack={handleBack} />;
  }

  if (viewMode === 'candidate') {
    return <CandidateForm onBack={handleBack} />;
  }

  // Show selection cards
  return (
    <main className="pt-20">
      <div className="min-h-screen bg-white flex items-center justify-center px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black rounded-full blur-3xl opacity-10"></div>
        </div>
        
        <div className="max-w-6xl mx-auto w-full py-20 relative z-10">
          <div className="text-center mb-16">
            <div className="w-24 h-1 bg-black mx-auto mb-8"></div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-black via-gray-500 to-black bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
              Enter the ecosystem
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Access the InstinctX platform where matches are made, talent is trained, and partnerships thrive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Client Card */}
            <div
              onClick={handleClientClick}
              className="bg-gray-50 border-2 border-gray-200 hover:border-black p-12 cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div>
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center group-hover:bg-gray-800 transition-colors">
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
                      className="w-10 h-10 text-white"
                    >
                      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                      <path d="M10 6h4"></path>
                      <path d="M10 10h4"></path>
                      <path d="M10 14h4"></path>
                      <path d="M10 18h4"></path>
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-black">I&apos;m a Client</h2>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Apply to hire elite operators. Get matched with Accelerator Graduates. Access lifetime talent.
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-500 font-light w-full">
                  <div className="flex items-center">
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
                      className="w-4 h-4 mr-2 flex-shrink-0"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span>Match with top 15 graduates monthly</span>
                  </div>
                  <div className="flex items-center">
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
                      className="w-4 h-4 mr-2 flex-shrink-0"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span>Access platform for management &amp; billing</span>
                  </div>
                  <div className="flex items-center">
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
                      className="w-4 h-4 mr-2 flex-shrink-0"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span>Lifetime access to talent pool</span>
                  </div>
                </div>
                <div className="flex items-center text-black font-medium group-hover:translate-x-2 transition-transform">
                  Continue as Client
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
                    className="w-5 h-5 ml-2"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Candidate Card */}
            <div
              onClick={handleCandidateClick}
              className="bg-gray-50 border-2 border-gray-200 hover:border-black p-12 cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div>
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center group-hover:bg-gray-800 transition-colors">
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
                      className="w-10 h-10 text-white"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-black">I&apos;m a Candidate</h2>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Apply for the Accelerator Program. Get trained by Stanford professors. Guaranteed placement.
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-500 font-light w-full">
                  <div className="flex items-center">
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
                      className="w-4 h-4 mr-2 flex-shrink-0"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span>8-week elite training program</span>
                  </div>
                  <div className="flex items-center">
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
                      className="w-4 h-4 mr-2 flex-shrink-0"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span>Platform access for Accelerator</span>
                  </div>
                  <div className="flex items-center">
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
                      className="w-4 h-4 mr-2 flex-shrink-0"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span>Guaranteed job placement</span>
                  </div>
                </div>
                <div className="flex items-center text-black font-medium group-hover:translate-x-2 transition-transform">
                  Continue as Candidate
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
                    className="w-5 h-5 ml-2"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500 font-light">
              One platform. Two paths. Infinite possibilities.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
