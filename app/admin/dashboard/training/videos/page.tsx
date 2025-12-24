'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/clientPortalApi';
import { useToast } from '@/contexts/ToastContext';

interface Video {
  id: number;
  title: string;
  youtube_url: string;
  display_order: number;
  created_at: string;
}

export default function AdminVideosPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    displayOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.userType === 'admin') {
      loadVideos();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getVideos();
      if (response.success && response.data) {
        setVideos(response.data.videos || []);
      } else {
        setError(response.message || 'Failed to load videos');
      }
    } catch (error: any) {
      console.error('Error loading videos:', error);
      setError(error.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingVideo) {
        const response = await adminApi.updateVideo(editingVideo.id, formData);
        if (response.success) {
          showToast('Video updated successfully', 'success');
          setShowModal(false);
          setEditingVideo(null);
          loadVideos();
        } else {
          setError(response.message || 'Failed to update video');
        }
      } else {
        const response = await adminApi.createVideo(formData.title, formData.youtubeUrl, formData.displayOrder);
        if (response.success) {
          showToast('Video added successfully', 'success');
          setShowModal(false);
          resetForm();
          loadVideos();
        } else {
          setError(response.message || 'Failed to create video');
        }
      }
    } catch (error: any) {
      console.error('Error saving video:', error);
      setError(error.message || 'Failed to save video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await adminApi.deleteVideo(id);
      if (response.success) {
        showToast('Video deleted successfully', 'success');
        loadVideos();
      } else {
        showToast(response.message || 'Failed to delete video', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting video:', error);
      showToast(error.message || 'Failed to delete video', 'error');
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      youtubeUrl: video.youtube_url,
      displayOrder: video.display_order,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      youtubeUrl: '',
      displayOrder: 0,
    });
    setEditingVideo(null);
  };

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  if (loading && videos.length === 0) {
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Training Videos</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
          >
            + Add Video
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No videos added yet.</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
            >
              Add Your First Video
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="dashboard-table-head-row">
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Title</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>YouTube URL</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Display Order</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.map((video) => {
                    const videoId = extractVideoId(video.youtube_url);
                    return (
                      <tr key={video.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-black">{video.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 truncate max-w-md">{video.youtube_url}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{video.display_order}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(video)}
                            className="text-black hover:text-gray-700 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingVideo ? 'Edit Video' : 'Add Video'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL *
                  </label>
                  <input
                    type="text"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="0"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingVideo ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

