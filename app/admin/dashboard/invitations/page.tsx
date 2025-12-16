'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi, PendingInvitation } from '@/lib/clientPortalApi';

export default function AdminInvitationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [approvedInvitations, setApprovedInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvitationLink, setShowInvitationLink] = useState<{ id: number; link: string; email: string } | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadInvitations();
    }
  }, [isAuthenticated, user]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const [pendingResponse, approvedResponse] = await Promise.all([
        adminApi.getPendingInvitations(),
        adminApi.getApprovedInvitations(),
      ]);
      
      if (pendingResponse.success && pendingResponse.data) {
        setPendingInvitations(pendingResponse.data.invitations);
      }
      
      if (approvedResponse.success && approvedResponse.data) {
        setApprovedInvitations(approvedResponse.data.invitations);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const invitations = activeTab === 'pending' ? pendingInvitations : approvedInvitations;

  const handleApproveInvitation = async (invitationId: number) => {
    try {
      const response = await adminApi.approveInvitation(invitationId);
      if (response.success) {
        const linkResponse = await adminApi.getInvitationLink(invitationId);
        if (linkResponse.success && linkResponse.data) {
          setShowInvitationLink({
            id: invitationId,
            link: linkResponse.data.signupLink,
            email: linkResponse.data.email,
          });
        }
        // Reload both pending and approved lists
        await loadInvitations();
      }
    } catch (error) {
      console.error('Error approving invitation:', error);
      alert('Failed to approve invitation');
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    if (!confirm('Are you sure you want to reject this invitation?')) return;

    try {
      const response = await adminApi.rejectInvitation(invitationId);
      if (response.success) {
        // Reload pending list (rejected invitations won't show in approved)
        await loadInvitations();
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Failed to reject invitation');
    }
  };

  if (loading) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-6">Invitations</h1>
          
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Pending ({pendingInvitations.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Approved ({approvedInvitations.length})
            </button>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">
              {activeTab === 'pending' ? 'No pending invitations' : 'No approved invitations'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto sidebar-scroll">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited By</th>
                    {activeTab === 'pending' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    )}
                    {activeTab === 'approved' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved At</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {invitation.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invitation.organizationName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {invitation.role.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invitation.invitedByFirstName} {invitation.invitedByLastName}
                      </td>
                      {activeTab === 'pending' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </td>
                      )}
                      {activeTab === 'approved' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {(invitation as any).verifiedAt ? new Date((invitation as any).verifiedAt).toLocaleDateString() : 'N/A'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {activeTab === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveInvitation(invitation.id)}
                              className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectInvitation(invitation.id)}
                              className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const linkResponse = await adminApi.getInvitationLink(invitation.id);
                                if (linkResponse.success && linkResponse.data) {
                                  setShowInvitationLink({
                                    id: invitation.id,
                                    link: linkResponse.data.signupLink,
                                    email: invitation.email,
                                  });
                                }
                              } catch (error) {
                                console.error('Error getting invitation link:', error);
                                alert('Failed to get invitation link');
                              }
                            }}
                            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
                          >
                            View Link
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invitation Link Modal */}
        {showInvitationLink && (
          <InvitationLinkModal
            email={showInvitationLink.email}
            link={showInvitationLink.link}
            onClose={() => setShowInvitationLink(null)}
          />
        )}
      </div>
    </div>
  );
}

function InvitationLinkModal({ email, link, onClose }: { email: string; link: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-black mb-4">Invitation Approved</h2>
        <p className="text-gray-600 mb-4">
          The invitation for <strong>{email}</strong> has been approved. Copy the signup link below and send it to the user.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Signup Link</label>
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={link}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-md"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}

