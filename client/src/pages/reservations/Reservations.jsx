import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';
import { 
  Bookmark, Plus, Search, Filter, CheckCircle2, 
  Clock, AlertTriangle, ArrowRight, User, BookOpen 
} from 'lucide-react';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/reservations');
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!(await confirmAlert("Are you sure you want to cancel this reservation hold?"))) return;
    try {
      const res = await api.put(`/v1/reservations/${id}/cancel`);
      if (res.data.success) {
        toast.success("Reservation hold cancelled.");
        fetchReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel hold');
    }
  };

  const handleCollect = async (id) => {
    if (!(await confirmAlert("Mark this reserved copy as collected and issued to patron?"))) return;
    try {
      const res = await api.put(`/v1/reservations/${id}/collect`);
      if (res.data.success) {
        toast.success("Reservation fulfilled and collected!");
        fetchReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete collection');
    }
  };

  const readyCount = reservations.filter(r => r.status === 'READY').length;
  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
  const fulfilledCount = reservations.filter(r => r.status === 'FULFILLED' || r.status === 'COLLECTED').length;

  const filtered = reservations.filter(res => {
    const matchesSearch = 
      res.reservationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.memberId?.firstName + ' ' + res.memberId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.memberId?.memberCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Reservations & Hold Queue
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                Waitlist Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage patron book holds, queue positions, and pickup desk notifications
            </p>
          </div>
        </div>

        <Link 
          to="/reservations/new" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Place New Hold</span>
        </Link>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Holds in Queue</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {reservations.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active and fulfilled queue items</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ready for Pickup</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{readyCount}</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Holding at front circulation desk</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Waiting in Queue</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>{pendingCount}</span>
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Awaiting book returns</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fulfilled Loans</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {fulfilledCount}
          </div>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">Collected by patron</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search hold ID, book title, member name or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto overflow-x-auto">
            {['ALL', 'READY', 'PENDING', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600/20 border-t-blue-600 mb-2"></div>
            <p className="text-xs text-slate-400">Loading reservation holds...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Hold ID</th>
                  <th className="px-5 py-3.5">Target Book</th>
                  <th className="px-5 py-3.5">Patron Member</th>
                  <th className="px-4 py-3.5">Queue Slot</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Pickup Expiry</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-400">
                      No reservations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map(res => (
                    <tr 
                      key={res._id} 
                      className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-white/5">
                          {res.reservationCode || res._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {res.bookId?.title || 'Unknown Title'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {res.memberId?.firstName} {res.memberId?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {res.memberId?.memberCode}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {res.status === 'PENDING' ? (
                          <span className="font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                            #{res.queuePosition || 1}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 ${
                          res.status === 'READY'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                          res.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            res.status === 'READY' ? 'bg-emerald-500' :
                            res.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></span>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {res.expiryDate ? new Date(res.expiryDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === 'READY' && (
                            <button 
                              onClick={() => handleCollect(res._id)} 
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                            >
                              Fulfill
                            </button>
                          )}
                          {(res.status === 'PENDING' || res.status === 'READY') && (
                            <button 
                              onClick={() => handleCancel(res._id)} 
                              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 rounded-lg font-semibold text-xs transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
