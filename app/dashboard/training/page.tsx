'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TrainingPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType !== 'candidate') {
      router.push('/dashboard');
      return;
    }

    setLoading(false);
  }, [isAuthenticated, authLoading, user, router]);

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
        <h1 className="text-3xl font-bold text-black mb-8">Training Modules</h1>
        
        <div className="flex justify-center">
          <div className="w-full max-w-[800px]">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-md"
                  src="https://www.youtube.com/embed/wDchsz8nmbo"
                  title="1 Minute Sample Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="mt-6 bg-white rounded-lg p-6 text-center border border-gray-200">
              <p className="text-gray-600 mb-2">Interactive courses, quizzes, and progress tracking will be available here.</p>
              <p className="text-sm text-gray-500">Training modules are being set up by your administrator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

