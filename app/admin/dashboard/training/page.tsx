'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTrainingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to videos page by default
    router.push('/admin/dashboard/training/videos');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-light">Loading...</p>
      </div>
    </div>
  );
}

