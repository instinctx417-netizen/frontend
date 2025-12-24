'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi, PaginationMeta } from '@/lib/clientPortalApi';
import { clientPortalApi } from '@/lib/clientPortalApi';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/contexts/ToastContext';
import Pagination from '@/components/Pagination';

interface Ticket {
  id: number;
  ticketType: 'hr' | 'it';
  subject?: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  createdByUserId: number;
  createdByName?: string;
  assignedToUserId?: number;
  assignedToName?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface HRUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminTicketsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, connected } = useSocket();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>('');

  const ticketIdFromUrl = searchParams.get('id');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.userType === 'admin' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadTickets(1);
      loadHRUsers();
      
      if (ticketIdFromUrl) {
        const id = parseInt(ticketIdFromUrl, 10);
        if (!isNaN(id)) {
          setSelectedTicket(id);
          loadTicketDetails(id);
        }
      }
    }
  }, [isAuthenticated, authLoading, user, ticketIdFromUrl]);

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'admin') {
      loadTickets(1);
    }
  }, [statusFilter, ticketTypeFilter]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewTicket = (data: { ticket: any }) => {
      loadTickets(pagination?.page || 1);
    };

    const handleTicketMessage = (data: { ticketId: number; message: any }) => {
      if (selectedTicket === data.ticketId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    const handleNewNotification = (notification: any) => {
      // Reload ticket list to get updated data when a ticket notification is received
      if (notification.relatedEntityType === 'ticket' && notification.relatedEntityId) {
        const currentPage = pagination?.page || 1;
        const currentSelectedTicket = selectedTicket;
        loadTickets(currentPage).then(() => {
          // Keep the selected ticket open if it's still in the list
          if (currentSelectedTicket) {
            // Reload ticket details to refresh the opened ticket
            loadTicketDetails(currentSelectedTicket);
          }
        });
      }
    };

    socket.on('new-ticket', handleNewTicket);
    socket.on('ticket-message', handleTicketMessage);
    socket.on('new-notification', handleNewNotification);

    return () => {
      socket.off('new-ticket', handleNewTicket);
      socket.off('ticket-message', handleTicketMessage);
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket, connected, selectedTicket, pagination]);

  const loadTickets = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getAllTickets(
        statusFilter || undefined,
        (ticketTypeFilter === 'hr' || ticketTypeFilter === 'it') ? ticketTypeFilter : undefined,
        pageToLoad,
        10
      );
      if (response.success && response.data) {
        setTickets(response.data.tickets || []);
        setPagination(response.data.pagination || null);
      } else {
        setTickets([]);
        setPagination(null);
        setError(response.message || 'Failed to load tickets');
      }
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      setError(error.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadHRUsers = async () => {
    try {
      const response = await adminApi.getHRUsers();
      if (response.success && response.data) {
        setHrUsers(response.data.users || []);
      }
    } catch (error: any) {
      console.error('Error loading HR users:', error);
    }
  };

  const loadTicketDetails = async (id: number) => {
    try {
      const response = await clientPortalApi.getTicketById(id);
      if (response.success && response.data) {
        setTicketDetails(response.data.ticket);
        setMessages(response.data.messages || []);
        setTimeout(() => scrollToBottom(), 100);
        
        // Mark ticket-related notifications as read
        try {
          await clientPortalApi.markNotificationsAsReadByRelatedEntity('ticket', id);
          // Update local state to reset unread count for this ticket
          setTickets(prev => prev.map(t => 
            t.id === id ? { ...t, unreadCount: 0 } : t
          ));
        } catch (notifError) {
          // Don't show error for notification marking, just log it
          console.error('Error marking ticket notifications as read:', notifError);
        }
      }
    } catch (error: any) {
      console.error('Error loading ticket details:', error);
      showToast('Failed to load ticket details', 'error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      const response = await clientPortalApi.addTicketMessage(selectedTicket, newMessage.trim());
      if (response.success) {
        setNewMessage('');
        loadTicketDetails(selectedTicket);
      } else {
        showToast(response.message || 'Failed to send message', 'error');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      showToast(error.message || 'Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;

    setUpdatingStatus(true);
    try {
      const response = await adminApi.updateTicketStatus(selectedTicket, newStatus);
      if (response.success) {
        showToast('Ticket status updated successfully', 'success');
        loadTicketDetails(selectedTicket);
        loadTickets(pagination?.page || 1);
      } else {
        showToast(response.message || 'Failed to update status', 'error');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast(error.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignTicket = async (hrUserId: number | null) => {
    if (!selectedTicket) return;

    setAssigning(true);
    try {
      const response = await adminApi.assignTicket(selectedTicket, hrUserId);
      if (response.success) {
        showToast(hrUserId ? 'Ticket assigned successfully' : 'Ticket unassigned successfully', 'success');
        setShowAssignModal(false);
        loadTicketDetails(selectedTicket);
        loadTickets(pagination?.page || 1);
      } else {
        showToast(response.message || 'Failed to assign ticket', 'error');
      }
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      showToast(error.message || 'Failed to assign ticket', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleTicketClick = (ticketId: number) => {
    setSelectedTicket(ticketId);
    loadTicketDetails(ticketId);
    router.push(`/admin/dashboard/tickets?id=${ticketId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadTickets(newPage);
  };

  if (loading && !selectedTicket) {
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
          <h1 className="text-3xl font-bold text-black">Tickets</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={ticketTypeFilter}
            onChange={(e) => setTicketTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Types</option>
            <option value="hr">HR</option>
            <option value="it">IT</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-black">All Tickets</h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No tickets found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedTicket === ticket.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              ticket.ticketType === 'hr' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {ticket.ticketType.toUpperCase()}
                            </span>
                            {(ticket.unreadCount ?? 0) > 0 && (
                              <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                                {ticket.unreadCount}
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        {ticket.subject && (
                          <h3 className="font-semibold text-black mb-1">{ticket.subject}</h3>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          By: {ticket.createdByName || 'Unknown'}
                        </p>
                        {ticket.assignedToName && (
                          <p className="text-xs text-gray-500">
                            Assigned to: {ticket.assignedToName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {pagination && (
                <div className="p-4 border-t border-gray-200">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalCount}
                    pageSize={pagination.limit}
                    onPageChange={handlePageChange}
                    itemLabel="tickets"
                    showCount={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details / Chat */}
          <div className="lg:col-span-2">
            {selectedTicket && ticketDetails ? (
              <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          ticketDetails.ticketType === 'hr' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {ticketDetails.ticketType.toUpperCase()}
                        </span>
                        <select
                          value={ticketDetails.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={updatingStatus}
                          className="px-2 py-1 text-xs font-medium rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                        >
                          <option value="open">Open</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      {ticketDetails.subject && (
                        <h2 className="text-xl font-bold text-black">{ticketDetails.subject}</h2>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Created by: {ticketDetails.createdByName || 'Unknown'}
                      </p>
                      {ticketDetails.assignedToName && (
                        <p className="text-sm text-gray-600">
                          Assigned to: {ticketDetails.assignedToName}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md cursor-pointer"
                      >
                        {ticketDetails.assignedToUserId ? 'Reassign' : 'Assign'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTicket(null);
                          setTicketDetails(null);
                          setMessages([]);
                          router.push('/admin/dashboard/tickets');
                        }}
                        className="text-gray-500 hover:text-black"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{ticketDetails.description}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sentByUserId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sentByUserId === user?.id
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-black'
                      }`}>
                        <div className="text-xs font-medium mb-1 opacity-70">
                          {msg.sentByUserId === user?.id 
                            ? 'Me' 
                            : (msg.sentByUserType === 'admin' || msg.sentByUserType === 'hr')
                              ? 'Assistant'
                              : msg.sentByName}
                        </div>
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="px-6 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center h-[600px] flex items-center justify-center">
                <p className="text-gray-600">Select a ticket to view details and messages</p>
              </div>
            )}
          </div>
        </div>

        {/* Assign Modal */}
        {showAssignModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Assign Ticket</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to HR User
                  </label>
                  <select
                    defaultValue={ticketDetails?.assignedToUserId || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    onChange={(e) => {
                      const hrUserId = e.target.value ? parseInt(e.target.value, 10) : null;
                      handleAssignTicket(hrUserId);
                    }}
                    disabled={assigning}
                  >
                    <option value="">Unassign</option>
                    {hrUsers.map((hr) => (
                      <option key={hr.id} value={hr.id}>
                        {hr.firstName} {hr.lastName} ({hr.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors rounded-md cursor-pointer"
                    disabled={assigning}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

