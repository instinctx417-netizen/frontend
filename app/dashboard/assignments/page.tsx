'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AssignmentsPage() {
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
        <h1 className="text-3xl font-bold text-black mb-8">Assignments Dashboard</h1>
        
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <p className="text-gray-600 mb-4">View your active client assignments, contract end dates, performance reviews, and manager information.</p>
          <p className="text-sm text-gray-500">Assignment details will be displayed here once available.</p>
        </div>
      </div>
    </div>
  );
}

