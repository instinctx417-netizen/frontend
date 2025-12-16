'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'candidate';
  invitationToken?: string; // For invitation-based signup
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authApi.verifyToken();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        // Only logout if token is invalid (not a server error)
        removeAuthToken();
      }
    } catch (error: any) {
      const status = error.status || error.response?.status;
      const isServerError = 
        (status && (status >= 500 || status === 404)) ||
        error.message?.includes('Internal server error') || 
        error.message?.includes('Network') ||
        error.message?.includes('Failed to fetch') ||
        error.name === 'TypeError';
      
      if (isServerError) {
        showToast(
          'Something went wrong. Please reload the page.',
          'error'
        );
      } else {
        removeAuthToken();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        // Redirect to appropriate dashboard based on user type
        const userType = response.data.user.userType;
        if (userType === 'admin') {
          router.replace('/admin/dashboard');
        } else if (userType === 'hr') {
          router.replace('/hr/dashboard');
        } else {
          router.replace('/dashboard');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authApi.register(userData);
      if (response.success && response.data) {
        // For candidates, don't log them in - account is for office use only
        if (userData.userType === 'candidate') {
          // Return success without logging in
          return;
        }
        
        // For clients and other user types, log them in
        setAuthToken(response.data.token);
        setUser(response.data.user);
        // Redirect to appropriate dashboard based on user type
        const userType = response.data.user.userType;
        if (userType === 'admin') {
          router.replace('/admin/dashboard');
        } else if (userType === 'hr') {
          router.replace('/hr/dashboard');
        } else {
          router.replace('/dashboard');
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth is not valid');
  }
  return context;
}

