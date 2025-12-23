'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { clientPortalApi } from '@/lib/clientPortalApi';

export default function StaffProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    favoriteFood: '',
    favoriteMovie: '',
    hobbies: '',
  });

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
      loadProfile();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await clientPortalApi.getStaffProfile();
      if (response.success && response.data) {
        const profileData = response.data.staff.profileData || {};
        setFormData({
          favoriteFood: profileData.favoriteFood || '',
          favoriteMovie: profileData.favoriteMovie || '',
          hobbies: profileData.hobbies || '',
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await clientPortalApi.updateStaffProfile({
        favoriteFood: formData.favoriteFood.trim() || undefined,
        favoriteMovie: formData.favoriteMovie.trim() || undefined,
        hobbies: formData.hobbies.trim() || undefined,
      });

      if (response.success) {
        showToast('Profile updated successfully!', 'success');
      } else {
        setError(response.message || 'Failed to save profile');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-black mb-8">About Me</h1>
        
        <div className="bg-white rounded-lg p-12 border border-gray-200">
          <p className="text-gray-600 mb-6">Share information about yourself beyond your CV - favorite food, favorite movie, hobbies, and more.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Food</label>
              <input
                type="text"
                value={formData.favoriteFood}
                onChange={(e) => setFormData({ ...formData, favoriteFood: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your favorite food"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Movie</label>
              <input
                type="text"
                value={formData.favoriteMovie}
                onChange={(e) => setFormData({ ...formData, favoriteMovie: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your favorite movie"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hobbies & Interests</label>
              <textarea
                rows={4}
                value={formData.hobbies}
                onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Tell us about your hobbies and interests"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

