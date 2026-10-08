import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Ticket, Plus, Search, Filter, X, Download, Clock, 
  CheckCircle2, AlertTriangle, MessageSquare, ShieldAlert,
  ArrowRight, Sparkles, User, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import CreateTicket from './CreateTicket';

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

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/v1/tickets${query}`);
      if (res.data.success) {
        setTickets(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const filteredTickets = tickets.filter(ticket => {
    if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    const matchNum = (ticket.ticketNumber || '').toLowerCase().includes(q);
    const matchSub = (ticket.subject || '').toLowerCase().includes(q);
    const matchCat = (ticket.category || '').toLowerCase().includes(q);
    const matchUser = (ticket.createdBy?.name || '').toLowerCase().includes(q);

    return matchNum || matchSub || matchCat || matchUser;
  });

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'WAITING_CUSTOMER').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  const exportCSV = () => {
    if (tickets.length === 0) {
      toast.error("No tickets available to export");
      return;
    }

    try {
      const headers = ["Ticket_Number", "Subject", "Category", "Priority", "Status", "Created_By", "Updated_At"];
      const rows = tickets.map(t => [
        `"${t.ticketNumber || ''}"`,
        `"${(t.subject || '').replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${t.priority || ''}"`,
        `"${t.status || ''}"`,
        `"${t.createdBy?.name || 'System'}"`,
        `"${new Date(t.updatedAt).toISOString()}"`
      ]);

      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `LibraryOS_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Support tickets exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Ticket size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Support & Help Desk</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  v2.0 Titanium
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage operational service requests, bug reports, and hardware support issues.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchTickets}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh tickets"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition flex items-center gap-2"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Open New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tickets</span>
            <Ticket size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {tickets.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Institutional requests</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Open / Pending</span>
            <AlertTriangle size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <span>{openCount}</span>
            {openCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>}
          </div>
          <p className="text-[11px] text-blue-500 mt-1 font-medium">Awaiting response</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-amber-500 mt-1 font-medium">Under active investigation</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium">Successfully completed</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by ticket #, subject, category, or submitter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            {[
              { id: 'ALL', label: 'All Statuses' },
              { id: 'OPEN', label: 'Open' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'WAITING_CUSTOMER', label: 'Waiting on You' },
              { id: 'RESOLVED', label: 'Resolved' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs pt-1 flex-wrap">
          <span className="text-slate-400 font-semibold mr-1">Priority:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                priorityFilter === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              <span className="text-sm font-medium">Fetching support tickets...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Subject & Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-20 text-slate-400">
                      <div className="max-w-xs mx-auto text-center space-y-2">
                        <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Support Tickets</h4>
                        <p className="text-xs">No records matched your search or status filters.</p>
                        <button
                          onClick={() => { setSearch(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
                          className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(ticket => (
                    <tr key={ticket._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group">
                      <td className="px-6 py-4 font-mono font-bold text-xs">
                        <Link 
                          to={`/support/${ticket._id}`} 
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                        >
                          <span>{ticket.ticketNumber || 'TKT-000'}</span>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white max-w-sm truncate text-sm" title={ticket.subject}>
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {ticket.category || 'General'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border font-mono ${PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.LOW}`}>
                          {ticket.priority}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${STATUS_BADGES[ticket.status] || STATUS_BADGES.OPEN}`}>
                          {(ticket.status || 'OPEN').replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {(ticket.createdBy?.name || "U")[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {ticket.createdBy?.name || 'Staff User'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/support/${ticket._id}`} 
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTicket 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTickets();
          }} 
        />
      )}

    </div>
  );
};

export default Tickets;
