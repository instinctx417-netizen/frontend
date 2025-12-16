'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { clientPortalApi } from '@/lib/clientPortalApi';
import Link from 'next/link';

function InvitationSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated } = useAuth();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    const token = searchParams.get('token');
    if (token) {
      loadInvitation(token);
    } else {
      setError('Invalid invitation link. Missing token parameter.');
      setLoading(false);
    }
  }, [searchParams, isAuthenticated]);

  const loadInvitation = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await clientPortalApi.getInvitationByToken(token);
      if (response.success && response.data) {
        setInvitation(response.data.invitation);
      } else {
        setError('Invalid or expired invitation link');
      }
    } catch (err: any) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation. Please check your link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!invitation) {
      setError('Invitation not loaded');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: invitation.email, // Fixed from invitation
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: 'client', // Invited users are always clients
        phone: formData.phone,
        invitationToken: invitation.token,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-20 bg-gray-50">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">Loading invitation...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="min-h-screen pt-20 bg-gray-50">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-6">
          <div className="max-w-md w-full bg-white rounded-lg p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="w-8 h-8 text-red-600"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
            >
              Go to Signup
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-gray-50">
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="w-8 h-8 text-white"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">Complete Your Signup</h1>
              <p className="text-gray-600">
                You've been invited to join <strong className="text-black">{invitation?.organizationName}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Email: <strong className="text-gray-700">{invitation?.email}</strong> (cannot be changed)
              </p>
              {invitation?.role && (
                <p className="text-sm text-gray-500 mt-1">
                  Role: <strong className="text-gray-700 capitalize">{invitation.role.replace(/_/g, ' ')}</strong>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Create a password (min. 6 characters)"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Confirm your password"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-black font-medium hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function InvitationSignupPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-20 bg-gray-50">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <InvitationSignupContent />
    </Suspense>
  );
}

