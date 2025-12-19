'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsList from '@/components/notifications/NotificationsList';

export default function ClientNotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.userType !== 'client') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleNotificationClick = (notification: any) => {
    // Navigation based on notification type and relatedEntityType
    let targetPath = '';

    // Handle by relatedEntityType first (more specific)
    if (notification.relatedEntityType && notification.relatedEntityId) {
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

    // If no targetPath yet, check notification type
    if (!targetPath) {
      const notificationType = notification.type;
      
      // Job request-related notifications
      if (notificationType === 'job_request_received' || 
          notificationType === 'job_request_created' ||
          notificationType === 'job_request_updated' ||
          notificationType === 'job_request_assigned' ||
          notificationType === 'job_assigned') {
        // If we have relatedEntityId, go to detail page, otherwise list
        if (notification.relatedEntityId) {
          targetPath = `/dashboard/job-requests/detail?jobRequestId=${notification.relatedEntityId}`;
        } else {
          targetPath = `/dashboard/job-requests`;
        }
      }
      // Candidate-related notifications
      else if (notificationType === 'candidates_delivered' ||
               notificationType === 'candidate_added' ||
               notificationType === 'candidate_selected') {
        // Go to job requests page where candidates are shown
        if (notification.relatedEntityId) {
          targetPath = `/dashboard/job-requests/detail?jobRequestId=${notification.relatedEntityId}`;
        } else {
          targetPath = `/dashboard/job-requests`;
        }
      }
      // Interview-related notifications
      else if (notificationType === 'interview_scheduled' ||
               notificationType === 'interview_updated' ||
               notificationType === 'interview_cancelled' ||
               notificationType === 'interview_reminder') {
        targetPath = `/dashboard/interviews`;
      }
      // Organization-related notifications
      else if (notificationType === 'organization_activated' ||
               notificationType === 'organization_deactivated') {
        targetPath = `/dashboard`;
      }
      // Selection reminder
      else if (notificationType === 'selection_reminder') {
        targetPath = `/dashboard/job-requests`;
      }
      // Status update or system announcement
      else if (notificationType === 'status_update' ||
               notificationType === 'system_announcement') {
        targetPath = `/dashboard`;
      }
    }

    if (targetPath) {
      router.push(targetPath);
    }
  };

  return <NotificationsList onNotificationClick={handleNotificationClick} />;
}

