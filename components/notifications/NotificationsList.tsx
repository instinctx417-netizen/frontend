'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clientPortalApi, Notification, PaginationMeta } from '@/lib/clientPortalApi';
import { useToast } from '@/contexts/ToastContext';
import Pagination from '@/components/Pagination';

interface NotificationsListProps {
  backHref?: string;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationsList({ backHref, onNotificationClick }: NotificationsListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchNotifications(1);
    }
  }, []);

  const fetchNotifications = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      const response = await clientPortalApi.getNotifications({
        page: pageToLoad,
        limit: 10,
      });
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchNotifications(newPage);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      setMarkingRead(id);
      const response = await clientPortalApi.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('Failed to mark notification as read', 'error');
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await clientPortalApi.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
        );
        showToast('All notifications marked as read', 'success');
        if (pagination) {
          fetchNotifications(pagination.page);
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first (don't wait for it to complete)
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate immediately
    if (onNotificationClick) {
      // Call the custom handler - it should handle navigation
      onNotificationClick(notification);
    } else {
      // Default navigation based on notification type (for client users)
      if (notification.relatedEntityType && notification.relatedEntityId) {
        if (notification.relatedEntityType === 'job_request') {
          router.push(`/dashboard/job-requests/detail?jobRequestId=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'interview') {
          router.push(`/dashboard/interviews`);
        } else if (notification.relatedEntityType === 'candidate') {
          router.push(`/dashboard/job-requests`);
        }
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
            Loading notifications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-primary-lightest)',
                  color: 'var(--color-primary-dark)',
                }}
              >
                Mark all as read
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div
            className="dashboard-card rounded-lg p-12 text-center"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No notifications
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="dashboard-card rounded-lg p-4 transition-all cursor-pointer"
                style={{
                  backgroundColor: notification.read
                    ? 'var(--color-bg-primary)'
                    : 'var(--color-primary-lightest)',
                  borderColor: notification.read
                    ? 'var(--color-border)'
                    : 'var(--color-primary)',
                  borderWidth: notification.read ? '1px' : '2px',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleNotificationClick(notification);
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3
                        className="font-semibold text-base"
                        style={{
                          color: notification.read
                            ? 'var(--color-text-primary)'
                            : 'var(--color-primary-dark)',
                        }}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        />
                      )}
                    </div>
                    <p
                      className="text-sm mb-3"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        {new Date(notification.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={markingRead === notification.id}
                          className="text-xs px-2 py-1 rounded transition-colors hover:opacity-80 cursor-pointer disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                          }}
                        >
                          {markingRead === notification.id ? 'Marking...' : 'Mark as read'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.limit}
              onPageChange={handlePageChange}
              itemLabel="notifications"
            />
          </div>
        )}
      </div>
    </div>
  );
}

