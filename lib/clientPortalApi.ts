import { apiRequest, ApiResponse, User } from './api';

// Types
export interface Organization {
  id: number;
  name: string;
  organization_name?: string;
  industry?: string;
  companySize?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  departments?: Department[];
}

export interface Department {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface JobRequest {
  id: number;
  organizationId: number;
  departmentId?: number;
  requestedByUserId: number;
  hiringManagerUserId?: number;
  title: string;
  jobDescription: string;
  requirements?: string;
  timelineToHire?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: string;
  assignedToHrUserId?: number;
  assignedAt?: string;
  candidatesDeliveredAt?: string;
  lastReminderSentAt?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  departmentName?: string;
  department_name?: string;
  organization_name?: string;
  candidateCount?: number;
  interviewCount?: number;
  candidates?: Candidate[];
  interviews?: Interview[];
}

export interface Candidate {
  id: number;
  jobRequestId: number;
  userId?: number;
  name: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumePath?: string;
  profileSummary?: string;
  status: string;
  deliveredAt: string;
  viewedAt?: string;
  interviewCount?: number;
  lastInterviewDate?: string;
}

export interface Interview {
  id: number;
  jobRequestId: number;
  candidateId: number;
  scheduledByUserId: number;
  scheduled_at: string;
  durationMinutes: number;
  meetingLink?: string;
  meeting_platform?: string;
  status: string;
  notes?: string;
  feedback?: string;
  candidate_name?: string;
  candidateEmail?: string;
  job_title?: string;
  participants?: InterviewParticipant[];
  // Additional fields from backend
  organization_name?: string;
  department_name?: string;
  scheduled_by_first_name?: string;
  scheduled_by_last_name?: string;
}

export interface InterviewParticipant {
  id: number;
  interviewId: number;
  userId: number;
  role: 'organizer' | 'attendee';
  confirmed: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserInvitation {
  id: number;
  organizationId: number;
  invitedByUserId: number;
  email: string;
  role: string;
  token: string;
  status: string;
  verifiedByAdminId?: number;
  verifiedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

/**
 * Client Portal API functions
 */
export const clientPortalApi = {
  // Organizations
  getOrganizations: async (): Promise<ApiResponse<{ organizations: any[] }>> => {
    return apiRequest('/client-portal/organizations');
  },

  getOrganization: async (id: number): Promise<ApiResponse<{ organization: Organization }>> => {
    return apiRequest(`/client-portal/organizations/${id}`);
  },

  createOrganization: async (data: { name: string; industry?: string; companySize?: string }): Promise<ApiResponse<{ organization: Organization }>> => {
    return apiRequest('/client-portal/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Departments
  getDepartments: async (organizationId: number): Promise<ApiResponse<{ departments: Department[] }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/departments`);
  },

  createDepartment: async (organizationId: number, data: { name: string; description?: string }): Promise<ApiResponse<{ department: Department }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/departments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Organization Users
  getOrganizationUsers: async (organizationId: number): Promise<ApiResponse<{ users: Array<{ id: number; email: string; firstName: string; lastName: string; role: string }> }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/users`);
  },

  // Job Requests
  getJobRequests: async (organizationId: number, filters?: { status?: string; departmentId?: number }): Promise<ApiResponse<{ jobRequests: JobRequest[] }>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId.toString());
    const query = params.toString();
    return apiRequest(`/client-portal/organizations/${organizationId}/job-requests${query ? `?${query}` : ''}`);
  },

  getJobRequest: async (id: number): Promise<ApiResponse<{ jobRequest: JobRequest & { candidates?: Candidate[]; interviews?: Interview[] } }>> => {
    return apiRequest(`/client-portal/job-requests/${id}`);
  },

  createJobRequest: async (organizationId: number, data: {
    departmentId?: number;
    hiringManagerUserId?: number;
    title: string;
    jobDescription: string;
    requirements?: string;
    timelineToHire?: string;
    priority?: string;
  }): Promise<ApiResponse<{ jobRequest: JobRequest }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/job-requests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateJobRequest: async (id: number, data: Partial<JobRequest>): Promise<ApiResponse<{ jobRequest: JobRequest }>> => {
    return apiRequest(`/client-portal/job-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getJobRequestStatistics: async (organizationId: number, departmentId?: number): Promise<ApiResponse<{ statistics: any }>> => {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    return apiRequest(`/client-portal/organizations/${organizationId}/job-requests/statistics${query}`);
  },

  // Candidates
  getCandidates: async (jobRequestId: number): Promise<ApiResponse<{ candidates: Candidate[] }>> => {
    return apiRequest(`/client-portal/job-requests/${jobRequestId}/candidates`);
  },

  getCandidate: async (id: number): Promise<ApiResponse<{ candidate: Candidate }>> => {
    return apiRequest(`/client-portal/candidates/${id}`);
  },

  updateCandidateStatus: async (id: number, status: string): Promise<ApiResponse<{ candidate: Candidate }>> => {
    return apiRequest(`/client-portal/candidates/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Interviews
  getInterviews: async (jobRequestId: number): Promise<ApiResponse<{ interviews: Interview[] }>> => {
    return apiRequest(`/client-portal/job-requests/${jobRequestId}/interviews`);
  },

  getInterview: async (id: number): Promise<ApiResponse<{ interview: Interview }>> => {
    return apiRequest(`/client-portal/interviews/${id}`);
  },

  createInterview: async (data: {
    jobRequestId: number;
    candidateId: number;
    scheduled_at: string;
    durationMinutes?: number;
    meetingLink?: string;
    meetingPlatform?: string;
    notes?: string;
    participantUserIds?: number[];
  }): Promise<ApiResponse<{ interview: Interview }>> => {
    return apiRequest('/client-portal/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateInterview: async (id: number, data: Partial<Interview>): Promise<ApiResponse<{ interview: Interview }>> => {
    return apiRequest(`/client-portal/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getUpcomingInterviews: async (organizationId: number, limit?: number): Promise<ApiResponse<{ interviews: Interview[] }>> => {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequest(`/client-portal/organizations/${organizationId}/interviews/upcoming${query}`);
  },

  getOrganizationInterviews: async (organizationId: number): Promise<ApiResponse<{ interviews: Interview[] }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/interviews`);
  },

  getParticipantInterviews: async (): Promise<ApiResponse<{ interviews: Interview[] }>> => {
    return apiRequest('/client-portal/interviews/participant/me');
  },

  addInterviewParticipant: async (interviewId: number, userId: number, role?: string): Promise<ApiResponse<{ participant: InterviewParticipant }>> => {
    return apiRequest(`/client-portal/interviews/${interviewId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  },

  removeInterviewParticipant: async (interviewId: number, userId: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/interviews/${interviewId}/participants/${userId}`, {
      method: 'DELETE',
    });
  },

  // Invitations
  getInvitations: async (organizationId: number): Promise<ApiResponse<{ invitations: UserInvitation[] }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/invitations`);
  },

  createInvitation: async (organizationId: number, data: {
    email: string;
    role: string;
  }): Promise<ApiResponse<{ invitation: UserInvitation }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getInvitationByToken: async (token: string): Promise<ApiResponse<{ invitation: UserInvitation }>> => {
    return apiRequest(`/client-portal/invitations/token/${token}`);
  },

  // Notifications
  getNotifications: async (options?: { unreadOnly?: boolean; limit?: number }): Promise<ApiResponse<{ notifications: Notification[] }>> => {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    const query = params.toString();
    return apiRequest(`/client-portal/notifications${query ? `?${query}` : ''}`);
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiRequest('/client-portal/notifications/unread-count');
  },

  markNotificationAsRead: async (id: number): Promise<ApiResponse<{ notification: Notification }>> => {
    return apiRequest(`/client-portal/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllNotificationsAsRead: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiRequest('/client-portal/notifications/read-all', {
      method: 'PUT',
    });
  },

  deleteNotification: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // Dashboard
  getDepartmentStatusDashboard: async (organizationId: number): Promise<ApiResponse<{ departments: any[]; pendingSelections: any[] }>> => {
    return apiRequest(`/client-portal/organizations/${organizationId}/dashboard/departments`);
  },

  // Analytics
  getAnalytics: async (organizationId: number, departmentId?: number): Promise<ApiResponse<any>> => {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    return apiRequest(`/client-portal/organizations/${organizationId}/analytics${query}`);
  },
};

// Admin API types and functions
export interface HRUser {
  created_at?: string;
  createdAt?: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'hr';
}

export interface PendingInvitation {
  id: number;
  organizationId: number;
  organizationName: string;
  invitedByUserId: number;
  invitedByFirstName: string;
  invitedByLastName: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export const adminApi = {
  createHRUser: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse<{ user: HRUser }>> => {
    return apiRequest('/client-portal/admin/hr-users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHRUsers: async (): Promise<ApiResponse<{ users: HRUser[] }>> => {
    return apiRequest('/client-portal/admin/hr-users');
  },

  getPendingInvitations: async (): Promise<ApiResponse<{ invitations: PendingInvitation[] }>> => {
    return apiRequest('/client-portal/admin/invitations?status=pending');
  },

  getApprovedInvitations: async (): Promise<ApiResponse<{ invitations: PendingInvitation[] }>> => {
    return apiRequest('/client-portal/admin/invitations?status=approved');
  },

  approveInvitation: async (invitationId: number): Promise<ApiResponse<{ invitation: any }>> => {
    return apiRequest(`/client-portal/admin/invitations/${invitationId}/approve`, {
      method: 'POST',
    });
  },

  rejectInvitation: async (invitationId: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/admin/invitations/${invitationId}/reject`, {
      method: 'POST',
    });
  },

  getInvitationLink: async (invitationId: number): Promise<ApiResponse<{
    invitationId: number;
    email: string;
    signupLink: string;
    token: string;
  }>> => {
    return apiRequest(`/client-portal/admin/invitations/${invitationId}/link`);
  },

  getAllJobRequests: async (status?: string): Promise<ApiResponse<{ jobRequests: JobRequest[] }>> => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/client-portal/admin/job-requests${query}`);
  },

  assignHrToJobRequest: async (jobRequestId: number, hrUserId: number): Promise<ApiResponse<{ jobRequest: JobRequest }>> => {
    return apiRequest(`/client-portal/admin/job-requests/${jobRequestId}/assign-hr`, {
      method: 'POST',
      body: JSON.stringify({ hrUserId }),
    });
  },

  // Admin candidates endpoint
  getCandidateUsers: async (): Promise<ApiResponse<{ candidates: User[] }>> => {
    return apiRequest('/client-portal/admin/candidates');
  },

  getAllOrganizations: async (): Promise<ApiResponse<{ organizations: Organization[] }>> => {
    return apiRequest('/client-portal/admin/organizations');
  },

  getAllInterviews: async (): Promise<ApiResponse<{ interviews: Interview[] }>> => {
    return apiRequest('/client-portal/admin/interviews');
  },

  activateOrganization: async (organizationId: number): Promise<ApiResponse<{ organization: Organization }>> => {
    return apiRequest(`/client-portal/admin/organizations/${organizationId}/activate`, {
      method: 'POST',
    });
  },

  deactivateOrganization: async (organizationId: number): Promise<ApiResponse<{ organization: Organization }>> => {
    return apiRequest(`/client-portal/admin/organizations/${organizationId}/deactivate`, {
      method: 'POST',
    });
  },
};

// HR API functions
export const hrApi = {
  getAssignedJobRequests: async (): Promise<ApiResponse<{ jobRequests: JobRequest[] }>> => {
    return apiRequest('/client-portal/hr/job-requests');
  },

  getCandidateUsers: async (): Promise<ApiResponse<{ candidates: User[] }>> => {
    return apiRequest('/client-portal/hr/candidates');
  },

  pushCandidates: async (
    jobRequestId: number,
    candidateUserIds: number[]
  ): Promise<ApiResponse<{ candidates: Candidate[] }>> => {
    return apiRequest(`/client-portal/hr/job-requests/${jobRequestId}/candidates`, {
      method: 'POST',
      body: JSON.stringify({ candidateUserIds }),
    });
  },

  getDashboardStats: async (): Promise<ApiResponse<{
    statistics: {
      assignedCount: number;
      shortlistingCount: number;
      deliveredCount: number;
      totalCount: number;
    };
  }>> => {
    return apiRequest('/client-portal/hr/dashboard/stats');
  },

  getAssignedInterviews: async (): Promise<ApiResponse<{ interviews: Interview[] }>> => {
    return apiRequest('/client-portal/hr/interviews');
  },
};

