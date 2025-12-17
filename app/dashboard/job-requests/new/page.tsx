'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi, Organization, Department } from '@/lib/clientPortalApi';
import Link from 'next/link';

export default function NewJobRequestPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [organization, setOrganization] = useState<any | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);
  
  const [formData, setFormData] = useState({
    organizationId: '',
    departmentId: '',
    title: '',
    jobDescription: '',
    requirements: '',
    timelineToHire: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });

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
        setFormData(prev => ({ ...prev, organizationId: orgId.toString() }));
        loadDepartments(orgId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load organization');
    }
  };

  const loadDepartments = async (organizationId: number) => {
    try {
      const response = await clientPortalApi.getDepartments(organizationId);
      if (response.success && response.data) {
        setDepartments(response.data.departments);
      }
    } catch (err: any) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await clientPortalApi.createJobRequest(parseInt(formData.organizationId), {
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        title: formData.title,
        jobDescription: formData.jobDescription,
        requirements: formData.requirements || undefined,
        timelineToHire: formData.timelineToHire || undefined,
        priority: formData.priority,
      });

      if (response.success) {
        router.push('/dashboard');
      } else {
        setError(response.message || 'Failed to create job request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create job request');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated || user?.userType !== 'client') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-black mb-2">New Job Request</h1>
          <p className="text-gray-600 font-light mb-8">
            Submit a new job request to get matched with elite operators
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Organization
                </label>
                <p className="text-base text-black">
                  {organization ? (organization.organization_name || organization.name) : 'Loading...'}
                </p>
              </div>

              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-black mb-2">
                  Department
                </label>
                <select
                  id="departmentId"
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                placeholder="e.g. Senior Operations Manager"
              />
            </div>

            <div>
              <label htmlFor="jobDescription" className="block text-sm font-medium text-black mb-2">
                Job Description *
              </label>
              <textarea
                id="jobDescription"
                required
                rows={6}
                value={formData.jobDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                placeholder="Describe the role, responsibilities, and what success looks like..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-black mb-2">
                Requirements
              </label>
              <textarea
                id="requirements"
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                placeholder="Required skills, experience, qualifications..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timelineToHire" className="block text-sm font-medium text-black mb-2">
                  Timeline to Hire
                </label>
                <input
                  type="text"
                  id="timelineToHire"
                  value={formData.timelineToHire}
                  onChange={(e) => setFormData(prev => ({ ...prev, timelineToHire: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  placeholder="e.g. 2-4 weeks"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-black mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="dashboard-btn-primary px-8 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Job Request'}
              </button>
              <Link
                href="/dashboard"
                className="dashboard-btn-secondary px-8 py-3 rounded-md font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

