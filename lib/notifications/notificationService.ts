/**
 * Notification Service
 * Centralized service for creating and managing notifications
 * Import and use this service when you need to send notifications
 */

import { clientPortalApi } from '../clientPortalApi';

export interface CreateNotificationData {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

/**
 * Create a notification for a user
 * @param data - Notification data
 * @returns Promise with the created notification
 */
export async function createNotification(
  data: CreateNotificationData
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await clientPortalApi.createNotification(data);
    return response;
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      message: error.message || 'Failed to create notification',
    };
  }
}

/**
 * Create notifications for multiple users
 * @param userIds - Array of user IDs
 * @param notificationData - Notification data (without userId)
 * @returns Promise with results
 */
export async function createNotificationsForUsers(
  userIds: number[],
  notificationData: Omit<CreateNotificationData, 'userId'>
): Promise<{ success: boolean; created: number; failed: number }> {
  let created = 0;
  let failed = 0;

  const promises = userIds.map(async (userId) => {
    try {
      const result = await createNotification({
        ...notificationData,
        userId,
      });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  });

  await Promise.all(promises);

  return { success: true, created, failed };
}

/**
 * Predefined notification types and templates
 * Use these for consistent notification messaging
 */
export const NotificationTypes = {
  JOB_REQUEST_CREATED: 'job_request_created',
  JOB_REQUEST_UPDATED: 'job_request_updated',
  JOB_REQUEST_ASSIGNED: 'job_request_assigned',
  CANDIDATE_ADDED: 'candidate_added',
  CANDIDATE_SELECTED: 'candidate_selected',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_UPDATED: 'interview_updated',
  INTERVIEW_CANCELLED: 'interview_cancelled',
  INVITATION_SENT: 'invitation_sent',
  INVITATION_ACCEPTED: 'invitation_accepted',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

/**
 * Helper function to create a job request notification
 */
export async function notifyJobRequestCreated(
  userId: number,
  jobRequestId: number,
  jobRequestTitle: string
) {
  return createNotification({
    userId,
    type: NotificationTypes.JOB_REQUEST_CREATED,
    title: 'New Job Request',
    message: `A new job request "${jobRequestTitle}" has been created.`,
    relatedEntityType: 'job_request',
    relatedEntityId: jobRequestId,
  });
}

/**
 * Helper function to create a candidate selection notification
 */
export async function notifyCandidateSelected(
  userId: number,
  candidateId: number,
  candidateName: string,
  jobRequestId: number
) {
  return createNotification({
    userId,
    type: NotificationTypes.CANDIDATE_SELECTED,
    title: 'Candidate Selected',
    message: `${candidateName} has been selected for a job request.`,
    relatedEntityType: 'candidate',
    relatedEntityId: candidateId,
  });
}

/**
 * Helper function to create an interview scheduled notification
 */
export async function notifyInterviewScheduled(
  userId: number,
  interviewId: number,
  interviewTitle: string
) {
  return createNotification({
    userId,
    type: NotificationTypes.INTERVIEW_SCHEDULED,
    title: 'Interview Scheduled',
    message: `An interview "${interviewTitle}" has been scheduled.`,
    relatedEntityType: 'interview',
    relatedEntityId: interviewId,
  });
}

/**
 * Helper function to notify HR about job request assignment
 */
export async function notifyJobRequestAssigned(
  hrUserId: number,
  jobRequestId: number,
  jobRequestTitle: string
) {
  return createNotification({
    userId: hrUserId,
    type: NotificationTypes.JOB_REQUEST_ASSIGNED,
    title: 'Job Request Assigned',
    message: `You have been assigned to job request "${jobRequestTitle}".`,
    relatedEntityType: 'job_request',
    relatedEntityId: jobRequestId,
  });
}

