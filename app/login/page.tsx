'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.userType === 'admin') {
        router.replace('/admin/dashboard');
      } else if (user.userType === 'hr') {
        router.replace('/hr/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Navigation handled by AuthContext
    } catch (err: any) {
      // Display error message and stay on login page
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-2">Login</h1>
          <p className="text-gray-600 text-sm">
            Welcome back to InstinctX
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-md bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-black font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

