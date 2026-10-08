import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, MessageSquare, Send, ShieldAlert, Clock, User, 
  CheckCircle2, Lock, AlertTriangle, Check, Layers, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const PRIORITY_BADGES = {
  CRITICAL: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  LOW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
};

const STATUS_BADGES = {
  OPEN: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  WAITING_CUSTOMER: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
};

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
        setComments(res.data.data.comments || []);
      }
    } catch {
      toast.error('Failed to load ticket details');
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await api.post(`/v1/tickets/${id}/comments`, {
        comment: newComment,
        isInternal: user?.role === 'SUPER_ADMIN' ? isInternal : false
      });
      if (res.data.success) {
        setNewComment('');
        setIsInternal(false);
        fetchTicketDetails();
        toast.success("Reply recorded");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/v1/tickets/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
        fetchTicketDetails();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium">Loading ticket conversation...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Ticket not found.</p>
        <Link to="/support" className="text-indigo-600 hover:underline text-xs mt-2 inline-block">Return to Help Desk</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            to="/support" 
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1.5 mb-2 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Support Tickets</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              {ticket.subject}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold font-mono rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {ticket.ticketNumber}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border font-mono ${PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.LOW}`}>
              {ticket.priority}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reported by <strong className="text-slate-700 dark:text-slate-300">{ticket.createdBy?.name}</strong> • {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_CUSTOMER">Waiting on Customer</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Conversation Stream (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Original Problem Description Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {(ticket.createdBy?.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {ticket.createdBy?.name || 'Customer'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Initial Incident Report
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Comment Thread */}
          {comments.map((comment) => {
            const isStaff = comment.senderRole === 'SUPER_ADMIN' || comment.senderRole === 'LIBRARY_ADMIN';
            return (
              <div 
                key={comment._id} 
                className={`p-6 rounded-3xl backdrop-blur-xl border shadow-md space-y-3 ${
                  comment.isInternal
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                    : isStaff
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-sm ${
                      isStaff ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-slate-500'
                    }`}>
                      {(comment.sender?.name || "S")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {comment.sender?.name || 'Support Agent'}
                        </span>
                        {isStaff && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                            Support Team
                          </span>
                        )}
                        {comment.isInternal && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 flex items-center gap-1">
                            <Lock size={10} /> Internal Note
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {comment.comment}
                </div>
              </div>
            );
          })}

          {/* Reply Composer Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <MessageSquare size={15} className="text-indigo-500" />
              <span>Post Response / Update</span>
            </h3>

            <textarea
              rows="4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleAddComment();
                }
              }}
              placeholder="Type your response here... (Press Ctrl+Enter to send)"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none leading-relaxed"
            ></textarea>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {user?.role === 'SUPER_ADMIN' && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Mark as internal note (hidden from customer)</span>
                </label>
              )}

              <button
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 ml-auto"
              >
                <Send size={14} />
                <span>{submitting ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Metadata (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
              Ticket Intelligence
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Category</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.category}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Current Status</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${STATUS_BADGES[ticket.status] || STATUS_BADGES.OPEN}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Priority Level</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.LOW}`}>
                  {ticket.priority}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-0.5">Submitted On</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Last Activity</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </span>
              </div>

              {ticket.resolvedAt && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold block">Resolved On:</span>
                  <span className="font-mono text-[11px]">{new Date(ticket.resolvedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Quick Actions
            </h3>
            
            {ticket.status !== 'RESOLVED' && (
              <button
                onClick={() => handleStatusChange('RESOLVED')}
                className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 size={14} />
                <span>Mark as Resolved</span>
              </button>
            )}

            {ticket.status !== 'CLOSED' && (
              <button
                onClick={() => handleStatusChange('CLOSED')}
                className="w-full py-2 rounded-xl font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                Close Ticket
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default TicketDetails;
