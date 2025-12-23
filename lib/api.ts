const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg: string; param: string }>;
}

export interface User {
  id: number;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'candidate' | 'admin' | 'hr';
  role?: string; 
  createdAt?: string;
  // Client fields
  companyName?: string;
  industry?: string;
  companySize?: string;
  // Other profile fields can be added as needed
  // Candidate-specific fields
  fullName?: string;
  location?: string;
  country?: string;
  timezone?: string;
  primaryFunction?: string;
  yearsExperience?: string | number;
  currentRole?: string;
  education?: string;
  englishProficiency?: string;
  availability?: string;
  linkedIn?: string;
  portfolio?: string;
  whyInstinctX?: string;
  startupExperience?: string;
  resumePath?: string;
  profilePicPath?: string;
  candidateDocuments?: string[] | any;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * API client with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract error message from response
      const errorMessage = data.message || data.error || 'Request failed';
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('API request error:', error);
    // Preserve status if it exists
    if (error.status) {
      const newError: any = new Error(error.message || 'Request failed');
      newError.status = error.status;
      throw newError;
    }
    throw error;
  }
}

/**
 * Auth API functions
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: 'client' | 'candidate';
    // Client fields (optional)
    companyName?: string;
    industry?: string;
    companySize?: string;
    contactName?: string;
    phone?: string;
    hireType?: string;
    engagementType?: string;
    timeline?: string;
    jobFunctions?: string[];
    specificNeeds?: string;
    heardFrom?: string;
    // Candidate fields (optional)
    fullName?: string;
    location?: string;
    country?: string;
    timezone?: string;
    primaryFunction?: string;
    yearsExperience?: string;
    currentRole?: string;
    education?: string;
    englishProficiency?: string;
    availability?: string;
    linkedIn?: string;
    portfolio?: string;
    whyInstinctX?: string;
    startupExperience?: string;
    resumePath?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest<{ user: User }>('/auth/profile', {
      method: 'GET',
    });
  },

  /**
   * Verify token
   */
  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest<{ user: User }>('/auth/verify', {
      method: 'GET',
    });
  },
};

/**
 * Store token in localStorage
 */
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

/**
 * Get token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Remove token from localStorage
 */
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

