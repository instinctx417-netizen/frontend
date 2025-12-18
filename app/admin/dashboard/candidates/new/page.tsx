'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CandidateForm from '@/components/forms/CandidateForm';

export default function AdminNewCandidatePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.userType !== 'admin') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleBack = () => {
    router.push('/admin/dashboard/candidates');
  };

  return (
    <CandidateForm onBack={handleBack} contextRole="admin" />
  );
}


