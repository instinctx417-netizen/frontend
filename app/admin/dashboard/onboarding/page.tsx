'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/clientPortalApi';
import { useToast } from '@/contexts/ToastContext';

interface Requirement {
  id: number;
  title: string;
  description?: string;
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminOnboardingPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isRequired: true,
    displayOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.userType === 'admin') {
      loadRequirements();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getOnboardingRequirements();
      if (response.success && response.data) {
        setRequirements(response.data.requirements || []);
      } else {
        setError(response.message || 'Failed to load requirements');
      }
    } catch (error: any) {
      console.error('Error loading requirements:', error);
      setError(error.message || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingRequirement) {
        const response = await adminApi.updateOnboardingRequirement(editingRequirement.id, formData);
        if (response.success) {
          showToast('Requirement updated successfully', 'success');
          setShowModal(false);
          setEditingRequirement(null);
          loadRequirements();
        } else {
          setError(response.message || 'Failed to update requirement');
        }
      } else {
        const response = await adminApi.createOnboardingRequirement(formData);
        if (response.success) {
          showToast('Requirement created successfully', 'success');
          setShowModal(false);
          resetForm();
          loadRequirements();
        } else {
          setError(response.message || 'Failed to create requirement');
        }
      }
    } catch (error: any) {
      console.error('Error saving requirement:', error);
      setError(error.message || 'Failed to save requirement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this requirement? This will also delete all staff submissions.')) return;

    try {
      const response = await adminApi.deleteOnboardingRequirement(id);
      if (response.success) {
        showToast('Requirement deleted successfully', 'success');
        loadRequirements();
      } else {
        showToast(response.message || 'Failed to delete requirement', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting requirement:', error);
      showToast(error.message || 'Failed to delete requirement', 'error');
    }
  };

  const handleEdit = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setFormData({
      title: requirement.title,
      description: requirement.description || '',
      isRequired: requirement.is_required,
      displayOrder: requirement.display_order,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isRequired: true,
      displayOrder: 0,
    });
    setEditingRequirement(null);
  };

  if (loading && requirements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Onboarding Requirements</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
          >
            + Add Requirement
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {requirements.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No onboarding requirements added yet.</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
            >
              Add Your First Requirement
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="dashboard-table-head-row">
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Title</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Description</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Required</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Display Order</th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{requirement.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">
                          {requirement.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          requirement.is_required ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {requirement.is_required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{requirement.display_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(requirement)}
                          className="text-black hover:text-gray-700 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(requirement.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g., NIC, Birth Certificate"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    rows={3}
                    placeholder="Optional description for staff"
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="0"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingRequirement ? 'Update' : 'Add'}
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

