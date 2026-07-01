import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageSquare, Send, ShieldAlert, Clock, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/tickets/${id}`);
      if (res.data.success) {
        setTicket(res.data.data.ticket);
        setComments(res.data.data.comments);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await api.post(`/v1/tickets/${id}/comments`, {
        comment: newComment,
        isInternal: user.role === 'SUPER_ADMIN' ? isInternal : false
      });
      if (res.data.success) {
        setNewComment('');
        setIsInternal(false);
        fetchTicketDetails(); // Refresh to get the new comment and updated status
        toast.success("Reply added");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/v1/tickets/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`);
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading ticket...</div>;
  if (!ticket) return <div className="p-8 text-center">Ticket not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/support" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              {ticket.ticketNumber}
            </span>
          </div>
          <p className="text-gray-500 mt-1">Created by {ticket.createdBy?.name} on {new Date(ticket.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Conversation Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
              Original Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Conversation</h3>
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No replies yet.</p>
            ) : (
              comments.map((comment) => (
                <div 
                  key={comment._id} 
                  className={`p-4 rounded-xl border ${comment.isInternal ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {comment.userId?.name}
                          {comment.isInternal && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 rounded">Internal Note</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-10">{comment.comment}</p>
                </div>
              ))
            )}
          </div>

          {ticket.status !== 'CLOSED' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <form onSubmit={handleAddComment}>
                <textarea
                  required
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 mb-4"
                ></textarea>
                
                <div className="flex justify-between items-center">
                  {user.role === 'SUPER_ADMIN' ? (
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <input 
                        type="checkbox" 
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      Add as Internal Note (hidden from customer)
                    </label>
                  ) : <div></div>}
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Ticket Info</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="font-medium text-gray-900 dark:text-white">{ticket.status.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Priority</div>
                <div className="font-medium text-gray-900 dark:text-white">{ticket.priority}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <div className="font-medium text-gray-900 dark:text-white">{ticket.category}</div>
              </div>
              {ticket.assignedTo && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Assigned To</div>
                  <div className="font-medium text-gray-900 dark:text-white">{ticket.assignedTo.name}</div>
                </div>
              )}
            </div>

            {user.role === 'SUPER_ADMIN' && ticket.status !== 'CLOSED' && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Admin Actions</h4>
                {ticket.status !== 'RESOLVED' && (
                  <button 
                    onClick={() => handleStatusChange('RESOLVED')}
                    className="w-full flex justify-center items-center px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </button>
                )}
                {ticket.status === 'RESOLVED' && (
                  <button 
                    onClick={() => handleStatusChange('CLOSED')}
                    className="w-full flex justify-center items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Close Ticket
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
