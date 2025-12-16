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
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client' || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Analytics</h1>
          {organization && (
            <p className="text-sm text-gray-600 font-light mt-1">
              {organization.organization_name || organization.name}
            </p>
          )}
        </div>

        {/* Time to Fill */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-sm text-gray-600 mb-3 font-light">Avg Days to Delivery</p>
            <p className="text-5xl font-bold text-black">{analytics.timeToFill.avgDaysToDelivery.toFixed(1)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-sm text-gray-600 mb-3 font-light">Avg Days to Fill</p>
            <p className="text-5xl font-bold text-black">{analytics.timeToFill.avgDaysToFill.toFixed(1)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-sm text-gray-600 mb-3 font-light">Total Hired</p>
            <p className="text-5xl font-bold text-green-600">{analytics.timeToFill.totalHired}</p>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Conversion Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2 font-light">Application to Interview</p>
              <p className="text-3xl font-bold text-black">{analytics.conversionRates.applicationToInterview}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2 font-light">Interview to Selection</p>
              <p className="text-3xl font-bold text-black">{analytics.conversionRates.interviewToSelection}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2 font-light">Selection to Hire</p>
              <p className="text-3xl font-bold text-black">{analytics.conversionRates.selectionToHire}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2 font-light">Overall Conversion</p>
              <p className="text-3xl font-bold text-black">{analytics.conversionRates.overallConversion}%</p>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        {analytics.departmentStats && analytics.departmentStats.length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">Department Performance</h2>
            </div>
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviews</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hired</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Days to Fill</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
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

