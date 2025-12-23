'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsList from '@/components/notifications/NotificationsList';

export default function HRNotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.userType !== 'hr') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleNotificationClick = (notification: any) => {
    // Navigation based on notification type and relatedEntityType
    let targetPath = '';

    // Handle by relatedEntityType first (more specific)
    if (notification.relatedEntityType && notification.relatedEntityId) {
      if (notification.relatedEntityType === 'job_request') {
        targetPath = `/hr/dashboard/job-requests`;
      } else if (notification.relatedEntityType === 'interview') {
        targetPath = `/hr/dashboard/interviews`;
      } else if (notification.relatedEntityType === 'candidate') {
        targetPath = `/hr/dashboard/candidates`;
      } else if (notification.relatedEntityType === 'ticket') {
        targetPath = `/hr/dashboard/tickets?id=${notification.relatedEntityId}`;
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
        targetPath = `/hr/dashboard/job-requests`;
      }
      // Candidate-related notifications
      else if (notificationType === 'candidates_delivered' ||
               notificationType === 'candidate_added' ||
               notificationType === 'candidate_selected') {
        targetPath = `/hr/dashboard/candidates`;
      }
      // Interview-related notifications
      else if (notificationType === 'interview_scheduled' ||
               notificationType === 'interview_updated' ||
               notificationType === 'interview_cancelled' ||
               notificationType === 'interview_reminder') {
        targetPath = `/hr/dashboard/interviews`;
      }
      // Selection reminder
      else if (notificationType === 'selection_reminder') {
        targetPath = `/hr/dashboard/job-requests`;
      }
      // Status update or system announcement
      else if (notificationType === 'status_update' ||
               notificationType === 'system_announcement') {
        targetPath = `/hr/dashboard`;
      }
      // Ticket-related notifications
      else if (notificationType === 'ticket_assigned' ||
               notificationType === 'ticket_message') {
        if (notification.relatedEntityId) {
          targetPath = `/hr/dashboard/tickets?id=${notification.relatedEntityId}`;
        } else {
          targetPath = `/hr/dashboard/tickets`;
        }
      }
    }

    if (targetPath) {
      router.push(targetPath);
    }
  };

  return <NotificationsList onNotificationClick={handleNotificationClick} />;
}

