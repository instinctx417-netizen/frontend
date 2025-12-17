'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi } from '@/lib/clientPortalApi';
import Link from 'next/link';
import { useDashboard } from '../layout';

interface DepartmentStatus {
  departmentId: number;
  departmentName: string;
  totalJobs: number;
  statusBreakdown: {
    received: number;
    assigned: number;
    shortlisting: number;
    candidatesDelivered: number;
    interviewsScheduled: number;
    selectionPending: number;
    hired: number;
  };
  interviews: {
    completed: number;
    pending: number;
  };
}

export default function DepartmentsDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { setSelectedJobRequestId } = useDashboard();
  const [organization, setOrganization] = useState<any | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<DepartmentStatus[]>([]);
  const [pendingSelections, setPendingSelections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptFormData, setDeptFormData] = useState({ name: '', description: '' });
  const [creatingDept, setCreatingDept] = useState(false);
  const [error, setError] = useState('');

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
        loadDepartmentStatus(orgId);
      }
    } catch (err: any) {
      console.error('Failed to load organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentStatus = async (organizationId: number) => {
    try {
      const response = await clientPortalApi.getDepartmentStatusDashboard(organizationId);
      if (response.success && response.data) {
        setDepartments(response.data.departments);
        setPendingSelections(response.data.pendingSelections);
      }
    } catch (err: any) {
      console.error('Failed to load department status:', err);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;
    
    setError('');
    setCreatingDept(true);

    try {
      const response = await clientPortalApi.createDepartment(selectedOrgId, {
        name: deptFormData.name,
        description: deptFormData.description || undefined,
      });

      if (response.success) {
        setShowDeptForm(false);
        setDeptFormData({ name: '', description: '' });
        await loadDepartmentStatus(selectedOrgId);
      } else {
        setError(response.message || 'Failed to create department');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create department');
    } finally {
      setCreatingDept(false);
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

  if (!isAuthenticated || user?.userType !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Departments</h1>
            {organization && (
              <p className="text-sm text-gray-600 font-light mt-1">
                {organization.organization_name || organization.name}
              </p>
            )}
          </div>
          {selectedOrgId && (
            <button
              onClick={() => setShowDeptForm(true)}
              className="px-6 py-2 dashboard-btn-primary font-medium transition-colors rounded-md"
            >
              + Create Department
            </button>
          )}
        </div>

        {/* Pending Selections Alert */}
        {pendingSelections.filter(p => p.needsReminder).length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-semibold text-black mb-3">Action Required</h3>
            <div className="space-y-2">
              {pendingSelections.filter(p => p.needsReminder).map((pending) => (
                <div key={pending.jobRequestId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">{pending.title}</p>
                    <p className="text-xs text-gray-600">{pending.departmentName} • {pending.daysSinceDelivery.toFixed(0)} days since candidate delivery</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedJobRequestId(pending.jobRequestId);
                      router.push('/dashboard/job-requests/detail');
                    }}
                    className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded-md"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.departmentId} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-black transition-colors">
              <h2 className="text-lg font-bold text-black mb-4">{dept.departmentName}</h2>
              
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-light">Total Jobs</span>
                  <span className="text-lg font-bold text-black">{dept.totalJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-light">Interviews Completed</span>
                  <span className="text-lg font-bold text-black">{dept.interviews.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-light">Interviews Pending</span>
                  <span className="text-lg font-bold text-black">{dept.interviews.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-light">Awaiting Selection</span>
                  <span className="text-lg font-bold text-black">{dept.statusBreakdown.selectionPending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-light">Hired</span>
                  <span className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>{dept.statusBreakdown.hired}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 mb-1">Candidates Delivered</p>
                    <p className="text-base font-semibold text-black">{dept.statusBreakdown.candidatesDelivered}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Interviews Scheduled</p>
                    <p className="text-base font-semibold text-black">{dept.statusBreakdown.interviewsScheduled}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 font-light">No departments found. Create departments to organize your hiring.</p>
          </div>
        )}

        {/* Create Department Modal */}
        {showDeptForm && selectedOrgId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Create Department</h2>
                <button
                  onClick={() => {
                    setShowDeptForm(false);
                    setDeptFormData({ name: '', description: '' });
                    setError('');
                  }}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div>
                  <label htmlFor="deptName" className="block text-sm font-medium text-black mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    id="deptName"
                    required
                    value={deptFormData.name}
                    onChange={(e) => setDeptFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    placeholder="e.g., Engineering, Sales, Marketing"
                  />
                </div>

                <div>
                  <label htmlFor="deptDescription" className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <textarea
                    id="deptDescription"
                    rows={3}
                    value={deptFormData.description}
                    onChange={(e) => setDeptFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={creatingDept}
                    className="flex-1 px-6 py-3 dashboard-btn-primary font-medium transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingDept ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeptForm(false);
                      setDeptFormData({ name: '', description: '' });
                      setError('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-black font-medium hover:bg-gray-200 transition-colors rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

