'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clientPortalApi, Notification } from '@/lib/clientPortalApi';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { socket, connected } = useSocket();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch recent notifications and unread count
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const [notificationsRes, countRes] = await Promise.all([
        clientPortalApi.getNotifications({ limit: 3 }),
        clientPortalApi.getUnreadCount(),
      ]);

      if (notificationsRes.success && notificationsRes.data) {
        setNotifications(notificationsRes.data.notifications || []);
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
  }, [isAuthenticated]);

  // Real-time notification listeners
  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for new notifications
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => {
        // Add new notification at the beginning, keep only 3 most recent
        const updated = [notification, ...prev].slice(0, 3);
        return updated;
      });
      setUnreadCount(prev => prev + 1);
    };

    // Listen for notification updates (e.g., marked as read)
    const handleNotificationUpdate = (update: { id: number; read: boolean }) => {
      setNotifications(prev =>
        prev.map(n =>
          n.id === update.id ? { ...n, read: update.read, readAt: update.read ? new Date().toISOString() : undefined } : n
        )
      );
      if (update.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    // Listen for unread count updates
    const handleUnreadCountUpdate = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    socket.on('new-notification', handleNewNotification);
    socket.on('notification-updated', handleNotificationUpdate);
    socket.on('unread-count-updated', handleUnreadCountUpdate);

    return () => {
      socket.off('new-notification', handleNewNotification);
      socket.off('notification-updated', handleNotificationUpdate);
      socket.off('unread-count-updated', handleUnreadCountUpdate);
    };
  }, [socket, connected]);

  // Fallback polling (only if Socket.io is not connected)
  useEffect(() => {
    if (!isAuthenticated || connected) return;

    // Poll every 30 seconds only if Socket.io is not connected
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, connected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await clientPortalApi.markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type and user role
    let targetPath = '';

    // Handle by relatedEntityType first (more specific)
    if (notification.relatedEntityType && notification.relatedEntityId) {
      if (user?.userType === 'admin') {
        if (notification.relatedEntityType === 'job_request') {
          targetPath = `/admin/dashboard/job-requests`;
        } else if (notification.relatedEntityType === 'interview') {
          targetPath = `/admin/dashboard/interviews`;
        } else if (notification.relatedEntityType === 'candidate') {
          targetPath = `/admin/dashboard/candidates`;
        } else if (notification.relatedEntityType === 'organization') {
          targetPath = `/admin/dashboard/organizations`;
        } else if (notification.relatedEntityType === 'invitation') {
          targetPath = `/admin/dashboard/invitations`;
        }
      } else if (user?.userType === 'hr') {
        if (notification.relatedEntityType === 'job_request') {
          targetPath = `/hr/dashboard/job-requests`;
        } else if (notification.relatedEntityType === 'interview') {
          targetPath = `/hr/dashboard/interviews`;
        } else if (notification.relatedEntityType === 'candidate') {
          targetPath = `/hr/dashboard/candidates`;
        }
      } else {
        if (notification.relatedEntityType === 'job_request') {
          targetPath = `/dashboard/job-requests/detail?jobRequestId=${notification.relatedEntityId}`;
        } else if (notification.relatedEntityType === 'interview') {
          targetPath = `/dashboard/interviews`;
        } else if (notification.relatedEntityType === 'candidate') {
          targetPath = `/dashboard/job-requests`;
        } else if (notification.relatedEntityType === 'organization') {
          targetPath = `/dashboard`;
        }
      }
    }

    // If no targetPath yet, check notification type
    if (!targetPath) {
      const notificationType = notification.type;
      
      if (user?.userType === 'admin') {
        // Invitation-related
        if (notificationType === 'invitation_sent' || 
            notificationType === 'invitation_approved' || 
            notificationType === 'invitation_rejected' ||
            notificationType === 'invitation_accepted') {
          targetPath = `/admin/dashboard/invitations`;
        }
        // Job request-related
        else if (notificationType === 'job_request_received' || 
                 notificationType === 'job_request_created' ||
                 notificationType === 'job_request_updated' ||
                 notificationType === 'job_request_assigned' ||
                 notificationType === 'job_assigned') {
          targetPath = `/admin/dashboard/job-requests`;
        }
        // Candidate-related
        else if (notificationType === 'candidates_delivered' ||
                 notificationType === 'candidate_added' ||
                 notificationType === 'candidate_selected') {
          targetPath = `/admin/dashboard/candidates`;
        }
        // Interview-related
        else if (notificationType === 'interview_scheduled' ||
                 notificationType === 'interview_updated' ||
                 notificationType === 'interview_cancelled' ||
                 notificationType === 'interview_reminder') {
          targetPath = `/admin/dashboard/interviews`;
        }
        // Organization-related
        else if (notificationType === 'organization_activated' ||
                 notificationType === 'organization_deactivated') {
          targetPath = `/admin/dashboard/organizations`;
        }
        // Other
        else if (notificationType === 'selection_reminder') {
          targetPath = `/admin/dashboard/job-requests`;
        }
        else if (notificationType === 'status_update' ||
                 notificationType === 'system_announcement') {
          targetPath = `/admin/dashboard`;
        }
      } else if (user?.userType === 'hr') {
        // Job request-related
        if (notificationType === 'job_request_received' || 
            notificationType === 'job_request_created' ||
            notificationType === 'job_request_updated' ||
            notificationType === 'job_request_assigned' ||
            notificationType === 'job_assigned') {
          targetPath = `/hr/dashboard/job-requests`;
        }
        // Candidate-related
        else if (notificationType === 'candidates_delivered' ||
                 notificationType === 'candidate_added' ||
                 notificationType === 'candidate_selected') {
          targetPath = `/hr/dashboard/candidates`;
        }
        // Interview-related
        else if (notificationType === 'interview_scheduled' ||
                 notificationType === 'interview_updated' ||
                 notificationType === 'interview_cancelled' ||
                 notificationType === 'interview_reminder') {
          targetPath = `/hr/dashboard/interviews`;
        }
        // Other
        else if (notificationType === 'selection_reminder') {
          targetPath = `/hr/dashboard/job-requests`;
        }
        else if (notificationType === 'status_update' ||
                 notificationType === 'system_announcement') {
          targetPath = `/hr/dashboard`;
        }
      } else {
        // Client navigation
        // Job request-related
        if (notificationType === 'job_request_received' || 
            notificationType === 'job_request_created' ||
            notificationType === 'job_request_updated' ||
            notificationType === 'job_request_assigned' ||
            notificationType === 'job_assigned') {
          if (notification.relatedEntityId) {
            targetPath = `/dashboard/job-requests/detail?jobRequestId=${notification.relatedEntityId}`;
          } else {
            targetPath = `/dashboard/job-requests`;
          }
        }
        // Candidate-related
        else if (notificationType === 'candidates_delivered' ||
                 notificationType === 'candidate_added' ||
                 notificationType === 'candidate_selected') {
          if (notification.relatedEntityId) {
            targetPath = `/dashboard/job-requests/detail?jobRequestId=${notification.relatedEntityId}`;
          } else {
            targetPath = `/dashboard/job-requests`;
          }
        }
        // Interview-related
        else if (notificationType === 'interview_scheduled' ||
                 notificationType === 'interview_updated' ||
                 notificationType === 'interview_cancelled' ||
                 notificationType === 'interview_reminder') {
          targetPath = `/dashboard/interviews`;
        }
        // Organization-related
        else if (notificationType === 'organization_activated' ||
                 notificationType === 'organization_deactivated') {
          targetPath = `/dashboard`;
        }
        // Other
        else if (notificationType === 'selection_reminder') {
          targetPath = `/dashboard/job-requests`;
        }
        else if (notificationType === 'status_update' ||
                 notificationType === 'system_announcement') {
          targetPath = `/dashboard`;
        }
      }
    }

    if (targetPath) {
      router.push(targetPath);
    }

    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    if (user?.userType === 'admin') {
      router.push('/admin/dashboard/notifications');
    } else if (user?.userType === 'hr') {
      router.push('/hr/dashboard/notifications');
    } else {
      router.push('/dashboard/notifications');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
        style={{
          background: 'var(--gradient-primary)',
          color: 'white',
        }}
        aria-label="Notifications"
      >
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
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--color-error)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 rounded-lg shadow-xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--color-primary-lightest)',
                  color: 'var(--color-primary-dark)',
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full text-left px-4 py-3 border-b transition-colors hover:bg-opacity-50 cursor-pointer"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: notification.read
                      ? 'transparent'
                      : 'var(--color-primary-lightest)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-sm mb-1 truncate"
                        style={{
                          color: notification.read
                            ? 'var(--color-text-secondary)'
                            : 'var(--color-text-primary)',
                        }}
                      >
                        {notification.title}
                      </p>
                      <p
                        className="text-xs line-clamp-2"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        {notification.message}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        {new Date(notification.createdAt || notification.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-3 border-t text-center"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={handleViewAll}
                className="text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
                style={{ color: 'var(--color-primary)' }}
              >
                View All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

