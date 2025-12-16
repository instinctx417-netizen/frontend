'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { clientPortalApi } from '@/lib/clientPortalApi';

interface DashboardContextType {
  organizationId?: number;
  refreshDepartments: () => void;
  selectedJobRequestId: number | null;
  setSelectedJobRequestId: (id: number | null) => void;
  selectedOrganizationId: number | null;
  setSelectedOrganizationId: (id: number | null) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  refreshDepartments: () => {},
  selectedJobRequestId: null,
  setSelectedJobRequestId: () => {},
  selectedOrganizationId: null,
  setSelectedOrganizationId: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState<number | undefined>();
  const [organizationStatus, setOrganizationStatus] = useState<'active' | 'inactive' | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [selectedJobRequestId, setSelectedJobRequestId] = useState<number | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client') {
      loadOrganization();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadOrganization = async () => {
    try {
      setLoadingOrg(true);
      const response = await clientPortalApi.getOrganizations();
      if (response.success && response.data && response.data.organizations.length > 0) {
        const firstOrg = response.data.organizations[0];
        const orgId = firstOrg.organization_id || firstOrg.id;
        const status = firstOrg.status || 'inactive';
        setOrganizationId(orgId);
        setOrganizationStatus(status);
      }
    } catch (err) {
      console.error('Failed to load organization:', err);
    } finally {
      setLoadingOrg(false);
    }
  };

  const refreshDepartments = () => {
    // This will be used by child components to refresh departments
  };

  const handleInviteTeam = () => {
    if (organizationId) {
      setSelectedOrganizationId(organizationId);
      router.push('/dashboard/organizations/invitations');
    }
  };

  if (authLoading || loadingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client') {
    return null;
  }

  // Check if organization is inactive
  if (organizationStatus === 'inactive') {
    return (
      <DashboardContext.Provider
        value={{
          organizationId,
          refreshDepartments,
          selectedJobRequestId,
          setSelectedJobRequestId,
          selectedOrganizationId,
          setSelectedOrganizationId,
        }}
      >
        <DashboardSidebar
          organizationId={organizationId}
          onInviteTeam={handleInviteTeam}
        />
        <div className="lg:pl-64 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="bg-white border border-gray-200 rounded-lg p-12">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-black mb-4">Account Pending Activation</h1>
              <p className="text-gray-600 mb-6 font-light">
                Your organization account is currently inactive and pending activation by an administrator.
              </p>
              <p className="text-sm text-gray-500 font-light">
                You will be able to access the dashboard once your account has been activated. Please contact support if you have any questions.
              </p>
            </div>
          </div>
        </div>
      </DashboardContext.Provider>
    );
  }

  return (
    <DashboardContext.Provider
      value={{
        organizationId,
        refreshDepartments,
        selectedJobRequestId,
        setSelectedJobRequestId,
        selectedOrganizationId,
        setSelectedOrganizationId,
      }}
    >
      <DashboardSidebar
        organizationId={organizationId}
        onInviteTeam={handleInviteTeam}
      />
      <div className="lg:pl-64 min-h-screen bg-gray-50">
        {children}
      </div>
    </DashboardContext.Provider>
  );
}

