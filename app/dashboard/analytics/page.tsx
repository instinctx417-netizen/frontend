'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi } from '@/lib/clientPortalApi';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [organization, setOrganization] = useState<any | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType === 'client' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadOrganization();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadOrganization = async () => {
    try {
      const response = await clientPortalApi.getOrganizations();
      if (response.success && response.data && response.data.organizations.length > 0) {
        const firstOrg = response.data.organizations[0];
        const orgId = firstOrg.organization_id || firstOrg.id;
        setOrganization(firstOrg);
        setSelectedOrgId(orgId);
        loadAnalytics(orgId);
      }
    } catch (err: any) {
      console.error('Failed to load organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (organizationId: number) => {
    try {
      const response = await clientPortalApi.getAnalytics(organizationId);
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p className="font-light" style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client' || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Analytics</h1>
          {organization && (
            <p className="text-sm font-light mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {organization.organization_name || organization.name}
            </p>
          )}
        </div>

        {/* Time to Fill */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="dashboard-card rounded-lg p-8">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Avg Days to Delivery</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>{analytics.timeToFill.avgDaysToDelivery.toFixed(1)}</p>
          </div>
          <div className="dashboard-card rounded-lg p-8">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Avg Days to Fill</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-secondary)' }}>{analytics.timeToFill.avgDaysToFill.toFixed(1)}</p>
          </div>
          <div className="dashboard-card rounded-lg p-8">
            <p className="text-sm mb-3 font-light" style={{ color: 'var(--color-text-secondary)' }}>Total Hired</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--color-success)' }}>{analytics.timeToFill.totalHired}</p>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="dashboard-card rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Conversion Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>Application to Interview</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{analytics.conversionRates.applicationToInterview}%</p>
            </div>
            <div>
              <p className="text-sm mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>Interview to Selection</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-secondary)' }}>{analytics.conversionRates.interviewToSelection}%</p>
            </div>
            <div>
              <p className="text-sm mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>Selection to Hire</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>{analytics.conversionRates.selectionToHire}%</p>
            </div>
            <div>
              <p className="text-sm mb-2 font-light" style={{ color: 'var(--color-text-secondary)' }}>Overall Conversion</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>{analytics.conversionRates.overallConversion}%</p>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        {analytics.departmentStats && analytics.departmentStats.length > 0 && (
          <div className="dashboard-card rounded-lg overflow-hidden">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Department Performance</h2>
            </div>
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Department</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Jobs</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Candidates</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Interviews</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Hired</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Avg Days to Fill</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.departmentStats.map((dept: any) => (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {dept.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {dept.job_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {dept.candidate_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {dept.interview_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
                        {dept.hired_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {dept.avg_days_to_fill != null ? Number(dept.avg_days_to_fill).toFixed(1) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

