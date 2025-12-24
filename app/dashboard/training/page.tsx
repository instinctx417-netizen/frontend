'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi } from '@/lib/clientPortalApi';

interface Video {
  id: number;
  title: string;
  youtube_url: string;
  display_order: number;
  created_at: string;
}

export default function TrainingPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      loadVideos();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientPortalApi.getVideos();
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

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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
        <h1 className="text-3xl font-bold text-black mb-8">My Learning</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-2">No training videos available yet.</p>
            <p className="text-sm text-gray-500">Training modules are being set up by your administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => {
              const videoId = extractVideoId(video.youtube_url);
              if (!videoId) return null;

              return (
                <div
                  key={video.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.open(video.youtube_url, '_blank')}
                >
                  {/* Thumbnail - 1:1 aspect ratio */}
                  <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                    <img
                      src={getThumbnailUrl(videoId)}
                      alt={video.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default thumbnail if maxresdefault fails
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }}
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90">
                        <svg
                          className="w-8 h-8 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Title - bottom */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-black line-clamp-2">{video.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
