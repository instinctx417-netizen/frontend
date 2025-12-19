'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsList from '@/components/notifications/NotificationsList';

export default function AdminNotificationsPage() {
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

  const handleNotificationClick = (notification: any) => {
    // Navigation based on notification type and relatedEntityType
    let targetPath = '';

    // Handle by relatedEntityType first (more specific)
    if (notification.relatedEntityType && notification.relatedEntityId) {
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
    }

    // If no targetPath yet, check notification type
    if (!targetPath) {
      const notificationType = notification.type;
      
      // Invitation-related notifications
      if (notificationType === 'invitation_sent' || 
          notificationType === 'invitation_approved' || 
          notificationType === 'invitation_rejected' ||
          notificationType === 'invitation_accepted') {
        targetPath = `/admin/dashboard/invitations`;
      }
      // Job request-related notifications
      else if (notificationType === 'job_request_received' || 
               notificationType === 'job_request_created' ||
               notificationType === 'job_request_updated' ||
               notificationType === 'job_request_assigned' ||
               notificationType === 'job_assigned') {
        targetPath = `/admin/dashboard/job-requests`;
      }
      // Candidate-related notifications
      else if (notificationType === 'candidates_delivered' ||
               notificationType === 'candidate_added' ||
               notificationType === 'candidate_selected') {
        targetPath = `/admin/dashboard/candidates`;
      }
      // Interview-related notifications
      else if (notificationType === 'interview_scheduled' ||
               notificationType === 'interview_updated' ||
               notificationType === 'interview_cancelled' ||
               notificationType === 'interview_reminder') {
        targetPath = `/admin/dashboard/interviews`;
      }
      // Organization-related notifications
      else if (notificationType === 'organization_activated' ||
               notificationType === 'organization_deactivated') {
        targetPath = `/admin/dashboard/organizations`;
      }
      // Selection reminder
      else if (notificationType === 'selection_reminder') {
        targetPath = `/admin/dashboard/job-requests`;
      }
      // Status update or system announcement
      else if (notificationType === 'status_update' ||
               notificationType === 'system_announcement') {
        // Stay on notifications page or go to dashboard
        targetPath = `/admin/dashboard`;
      }
    }

    if (targetPath) {
      router.push(targetPath);
    }
  };

  return <NotificationsList onNotificationClick={handleNotificationClick} />;
}

