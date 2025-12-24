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

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
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
  candidateUserId?: number;
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
  created_at: string;
  createdAt?: string;
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

  // Organization Staff
  getOrganizationStaff: async (
    organizationId: number,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ staff: User[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/organizations/${organizationId}/staff${query}`);
  },

  // Job Requests
  getJobRequests: async (
    organizationId: number,
    filters?: { status?: string; departmentId?: number },
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ jobRequests: JobRequest[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId.toString());
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
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

  // Candidate user profile (admin & HR shared)
  getCandidateUserDetails: async (id: number): Promise<ApiResponse<{ candidate: User }>> => {
    return apiRequest(`/client-portal/candidate-users/${id}`);
  },

  updateCandidateStatus: async (id: number, status: string): Promise<ApiResponse<{ candidate: Candidate }>> => {
    return apiRequest(`/client-portal/candidates/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  hireCandidate: async (id: number): Promise<ApiResponse<{ siteStaff: any }>> => {
    return apiRequest(`/client-portal/candidates/${id}/hire`, {
      method: 'POST',
    });
  },

  // Staff profile routes
  getStaffProfile: async (): Promise<ApiResponse<{ staff: { id: number; userId: number; positionTitle: string; organizationId: number; organizationName: string; hiredAt: string; profileData: any } }>> => {
    return apiRequest('/client-portal/staff/profile');
  },

  updateStaffProfile: async (data: { favoriteFood?: string; favoriteMovie?: string; hobbies?: string }): Promise<ApiResponse<{ staff: { id: number; profileData: any } }>> => {
    return apiRequest('/client-portal/staff/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Ticket routes (staff)
  createTicket: async (data: { ticketType: 'hr' | 'it'; subject?: string; description: string }): Promise<ApiResponse<{ ticket: any }>> => {
    return apiRequest('/client-portal/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyTickets: async (
    status?: string,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ tickets: any[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/tickets/my-tickets${query}`);
  },

  getTicketById: async (id: number): Promise<ApiResponse<{ ticket: any; messages: any[] }>> => {
    return apiRequest(`/client-portal/tickets/${id}`);
  },

  addTicketMessage: async (ticketId: number, message: string): Promise<ApiResponse<{ message: any }>> => {
    return apiRequest(`/client-portal/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
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

  getOrganizationInterviews: async (
    organizationId: number,
    status?: string,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ interviews: Interview[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/organizations/${organizationId}/interviews${query}`);
  },

  getParticipantInterviews: async (
    status?: string,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ interviews: Interview[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/interviews/participant/me${query}`);
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
  getInvitations: async (
    organizationId: number,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ invitations: UserInvitation[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/organizations/${organizationId}/invitations${query}`);
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
  createNotification: async (data: {
    userId: number;
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: number;
  }): Promise<ApiResponse<{ notification: Notification }>> => {
    return apiRequest('/client-portal/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getNotifications: async (
    options?: { unreadOnly?: boolean; limit?: number; page?: number }
  ): Promise<ApiResponse<{ notifications: Notification[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.page) params.append('page', options.page.toString());
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

  markNotificationsAsReadByRelatedEntity: async (relatedEntityType: string, relatedEntityId: number): Promise<ApiResponse<{ count: number }>> => {
    return apiRequest('/client-portal/notifications/read-by-related-entity', {
      method: 'PUT',
      body: JSON.stringify({ relatedEntityType, relatedEntityId }),
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

  // Log endpoints (admin only)
  getInterviewLogs: async (
    filters?: {
      interviewId?: number;
      actionType?: string;
      performedByUserId?: number;
      organizationId?: number;
      startDate?: string;
      endDate?: string;
    },
    page?: number,
    limit: number = 20
  ): Promise<ApiResponse<{ logs: any[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (filters?.interviewId) params.append('interviewId', filters.interviewId.toString());
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.performedByUserId) params.append('performedByUserId', filters.performedByUserId.toString());
    if (filters?.organizationId) params.append('organizationId', filters.organizationId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/interview-logs${query}`);
  },

  getInvitationLogs: async (
    filters?: {
      invitationId?: number;
      actionType?: string;
      performedByUserId?: number;
      organizationId?: number;
      email?: string;
      startDate?: string;
      endDate?: string;
    },
    page?: number,
    limit: number = 20
  ): Promise<ApiResponse<{ logs: any[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (filters?.invitationId) params.append('invitationId', filters.invitationId.toString());
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.performedByUserId) params.append('performedByUserId', filters.performedByUserId.toString());
    if (filters?.organizationId) params.append('organizationId', filters.organizationId.toString());
    if (filters?.email) params.append('email', filters.email);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/invitation-logs${query}`);
  },

  // Training - Videos
  getVideos: async (): Promise<ApiResponse<{ videos: any[] }>> => {
    return apiRequest('/client-portal/training/videos');
  },

  // Training - Quizzes
  getQuizzes: async (): Promise<ApiResponse<{ quizzes: any[]; answers: any[] }>> => {
    return apiRequest('/client-portal/training/quizzes');
  },

  submitQuizAnswer: async (quizId: number, selectedAnswer: string): Promise<ApiResponse<{ answer: any; isCorrect: boolean }>> => {
    return apiRequest('/client-portal/training/quizzes/answer', {
      method: 'POST',
      body: JSON.stringify({ quizId, selectedAnswer }),
    });
  },

  getQuizStats: async (userId?: number): Promise<ApiResponse<{ stats: any }>> => {
    const query = userId ? `?userId=${userId}` : '';
    return apiRequest(`/client-portal/training/quizzes/stats${query}`);
  },

  // Onboarding
  getOnboardingRequirements: async (userId?: number): Promise<ApiResponse<{ requirements: any[]; submissions: any[] }>> => {
    const query = userId ? `?userId=${userId}` : '';
    return apiRequest(`/client-portal/onboarding/requirements${query}`);
  },

  submitOnboardingFile: async (requirementId: number, file: File): Promise<ApiResponse<{ submission: any }>> => {
    const formData = new FormData();
    formData.append('requirementId', requirementId.toString());
    formData.append('file', file);
    return apiRequest('/client-portal/onboarding/submit', {
      method: 'POST',
      body: formData,
    });
  },

  deleteOnboardingSubmission: async (submissionId: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/onboarding/submissions/${submissionId}`, {
      method: 'DELETE',
    });
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

  getHRUsers: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ users: HRUser[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/hr-users${query}`);
  },

  getPendingInvitations: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ invitations: PendingInvitation[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    params.append('status', 'pending');
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = `?${params.toString()}`;
    return apiRequest(`/client-portal/admin/invitations${query}`);
  },

  getApprovedInvitations: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ invitations: PendingInvitation[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    params.append('status', 'approved');
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = `?${params.toString()}`;
    return apiRequest(`/client-portal/admin/invitations${query}`);
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

  // Log endpoints (admin only)
  getInterviewLogs: async (
    filters?: {
      interviewId?: number;
      actionType?: string;
      performedByUserId?: number;
      organizationId?: number;
      startDate?: string;
      endDate?: string;
    },
    page?: number,
    limit: number = 20
  ): Promise<ApiResponse<{ logs: any[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (filters?.interviewId) params.append('interviewId', filters.interviewId.toString());
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.performedByUserId) params.append('performedByUserId', filters.performedByUserId.toString());
    if (filters?.organizationId) params.append('organizationId', filters.organizationId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/interview-logs${query}`);
  },

  getInvitationLogs: async (
    filters?: {
      invitationId?: number;
      actionType?: string;
      performedByUserId?: number;
      organizationId?: number;
      email?: string;
      startDate?: string;
      endDate?: string;
    },
    page?: number,
    limit: number = 20
  ): Promise<ApiResponse<{ logs: any[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (filters?.invitationId) params.append('invitationId', filters.invitationId.toString());
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.performedByUserId) params.append('performedByUserId', filters.performedByUserId.toString());
    if (filters?.organizationId) params.append('organizationId', filters.organizationId.toString());
    if (filters?.email) params.append('email', filters.email);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/invitation-logs${query}`);
  },

  getAllJobRequests: async (
    status?: string,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ jobRequests: JobRequest[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/job-requests${query}`);
  },

  assignHrToJobRequest: async (jobRequestId: number, hrUserId: number): Promise<ApiResponse<{ jobRequest: JobRequest }>> => {
    return apiRequest(`/client-portal/admin/job-requests/${jobRequestId}/assign-hr`, {
      method: 'POST',
      body: JSON.stringify({ hrUserId }),
    });
  },

  // Admin candidates endpoint
  getCandidateUsers: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ candidates: User[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/candidates${query}`);
  },

  // Admin staff members endpoint
  getStaffMembers: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ staff: User[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/staff${query}`);
  },

  getAllOrganizations: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ organizations: Organization[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/organizations${query}`);
  },

  getAllInterviews: async (
    status?: string,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ interviews: Interview[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/interviews${query}`);
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

  // Admin ticket routes
  getAllTickets: async (
    status?: string,
    ticketType?: 'hr' | 'it',
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ tickets: any[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (ticketType) params.append('ticketType', ticketType);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/admin/tickets${query}`);
  },

  assignTicket: async (ticketId: number, assignedToUserId: number | null): Promise<ApiResponse<{ ticket: any }>> => {
    return apiRequest(`/client-portal/tickets/${ticketId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignedToUserId }),
    });
  },

  updateTicketStatus: async (ticketId: number, status: string): Promise<ApiResponse<{ ticket: any }>> => {
    return apiRequest(`/client-portal/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Training - Videos (Admin)
  getVideos: async (): Promise<ApiResponse<{ videos: any[] }>> => {
    return apiRequest('/client-portal/training/videos');
  },

  createVideo: async (title: string, youtubeUrl: string, displayOrder?: number): Promise<ApiResponse<{ video: any }>> => {
    return apiRequest('/client-portal/training/videos', {
      method: 'POST',
      body: JSON.stringify({ title, youtubeUrl, displayOrder }),
    });
  },

  updateVideo: async (id: number, data: { title?: string; youtubeUrl?: string; displayOrder?: number }): Promise<ApiResponse<{ video: any }>> => {
    return apiRequest(`/client-portal/training/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteVideo: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/training/videos/${id}`, {
      method: 'DELETE',
    });
  },

  // Training - Quizzes (Admin)
  getQuizzes: async (): Promise<ApiResponse<{ quizzes: any[]; answers: any[] }>> => {
    return apiRequest('/client-portal/training/quizzes');
  },

  createQuiz: async (data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
  }): Promise<ApiResponse<{ quiz: any }>> => {
    return apiRequest('/client-portal/training/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateQuiz: async (id: number, data: {
    question?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
  }): Promise<ApiResponse<{ quiz: any }>> => {
    return apiRequest(`/client-portal/training/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteQuiz: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/training/quizzes/${id}`, {
      method: 'DELETE',
    });
  },

  // Onboarding Requirements (Admin)
  getOnboardingRequirements: async (): Promise<ApiResponse<{ requirements: any[]; submissions: any[] }>> => {
    return apiRequest('/client-portal/onboarding/requirements');
  },

  createOnboardingRequirement: async (data: {
    title: string;
    description?: string;
    isRequired?: boolean;
    displayOrder?: number;
  }): Promise<ApiResponse<{ requirement: any }>> => {
    return apiRequest('/client-portal/onboarding/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateOnboardingRequirement: async (id: number, data: {
    title?: string;
    description?: string;
    isRequired?: boolean;
    displayOrder?: number;
  }): Promise<ApiResponse<{ requirement: any }>> => {
    return apiRequest(`/client-portal/onboarding/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteOnboardingRequirement: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/onboarding/requirements/${id}`, {
      method: 'DELETE',
    });
  },

  deleteOnboardingSubmission: async (submissionId: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/client-portal/onboarding/submissions/${submissionId}`, {
      method: 'DELETE',
    });
  },
};

// HR API functions
export const hrApi = {
  getAssignedJobRequests: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ jobRequests: JobRequest[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/hr/job-requests${query}`);
  },

  getCandidateUsers: async (
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ candidates: User[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/hr/candidates${query}`);
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

  getAssignedInterviews: async (
    status?: string,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ interviews: Interview[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/hr/interviews${query}`);
  },

  // HR ticket routes
  getAssignedTickets: async (
    status?: string,
    page?: number,
    limit: number = 10
  ): Promise<ApiResponse<{ tickets: any[]; pagination?: PaginationMeta }>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/client-portal/tickets/assigned${query}`);
  },

  updateTicketStatus: async (ticketId: number, status: string): Promise<ApiResponse<{ ticket: any }>> => {
    return apiRequest(`/client-portal/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

