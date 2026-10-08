import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  DollarSign, AlertCircle, CheckCircle2, Clock, Plus, 
  Search, ShieldAlert, Sparkles, Filter, Receipt, 
  ChevronRight, ArrowRight, User 
} from 'lucide-react';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Waive Modal State
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [waiveFineId, setWaiveFineId] = useState(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [waiveSubmitting, setWaiveSubmitting] = useState(false);

  // Manual Fine Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualMemberCode, setManualMemberCode] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/fines');
      if (res.data.success) {
        setFines(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const openWaiveModal = (id) => {
    setWaiveFineId(id);
    setWaiveReason("");
    setWaiveModalOpen(true);
  };

  const handleWaiveSubmit = async (e) => {
    e.preventDefault();
    if (!waiveReason) return toast.error("Reason is required");
    
    setWaiveSubmitting(true);
    try {
      const res = await api.put(`/v1/fines/${waiveFineId}/waive`, { reason: waiveReason });
      if (res.data.success) {
        toast.success("Fine waived successfully!");
        setWaiveModalOpen(false);
        fetchFines();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to waive fine');
    } finally {
      setWaiveSubmitting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualMemberCode || !manualAmount || !manualReason) return toast.error("All fields required");
    
    setManualSubmitting(true);
    try {
      const memRes = await api.get(`/v1/members?search=${encodeURIComponent(manualMemberCode.trim())}`);
      const member = memRes.data?.data?.find(m => m.memberCode?.toLowerCase() === manualMemberCode.trim().toLowerCase()) || memRes.data?.data?.[0];
      
      if (!member) {
        toast.error("Member not found with this code.");
        setManualSubmitting(false);
        return;
      }

      const res = await api.post('/v1/fines/manual', {
        memberId: member._id,
        amount: Number(manualAmount),
        reason: manualReason
      });

      if (res.data.success) {
        toast.success("Manual fine created successfully!");
        setManualModalOpen(false);
        fetchFines();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create fine');
    } finally {
      setManualSubmitting(false);
    }
  };

  const totalPending = fines.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL').reduce((acc, f) => acc + (f.pendingAmount || 0), 0);
  const totalCollected = fines.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalWaivedCount = fines.filter(f => f.status === 'WAIVED').length;
  const collectionRate = totalCollected + totalPending > 0 ? Math.round((totalCollected / (totalCollected + totalPending)) * 100) : 100;

  const filteredFines = fines.filter(f => {
    const matchesSearch = 
      f.fineCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.memberId?.firstName + ' ' + f.memberId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.memberId?.memberCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/25">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Fine & Penalty Ledger
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                Revenue Compliance
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track overdue penalties, process policy waivers, and reconcile fine collections
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setManualMemberCode(""); setManualAmount(""); setManualReason(""); setManualModalOpen(true);
          }} 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white dark:from-white dark:to-slate-200 dark:text-slate-900 dark:hover:from-slate-100 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Penalty</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Outstanding</div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            ₹{totalPending.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Pending student settlement</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Revenue Collected</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <span>₹{totalCollected.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Deposited into library treasury</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Waived Penalties</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalWaivedCount} <span className="text-xs font-normal text-slate-400">Records</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Authorized admin exceptions</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Collection Efficiency</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {collectionRate}%
          </div>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">Settled vs total dues ratio</p>
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
              placeholder="Search fine code, member name, ID or reason..." 
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
            {['ALL', 'PENDING', 'PARTIAL', 'PAID', 'WAIVED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-rose-600/20 border-t-rose-600 mb-2"></div>
            <p className="text-xs text-slate-400">Loading fine ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Fine ID</th>
                  <th className="px-5 py-3.5">Patron Member</th>
                  <th className="px-4 py-3.5">Type & Reason</th>
                  <th className="px-4 py-3.5">Total Dues</th>
                  <th className="px-4 py-3.5">Outstanding</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredFines.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-400">
                      No fine records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredFines.map(fine => (
                    <tr 
                      key={fine._id} 
                      className="hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-white/5">
                          {fine.fineCode || fine._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {fine.memberId?.firstName} {fine.memberId?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {fine.memberId?.memberCode}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {fine.fineType?.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {fine.reason || 'Overdue borrowing delay'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        ₹{fine.amount || 0}
                      </td>
                      <td className="px-4 py-3.5 font-black text-rose-600 dark:text-rose-400">
                        ₹{fine.pendingAmount || 0}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 ${
                          fine.status === 'PAID' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                          fine.status === 'PENDING' 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' :
                          fine.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            fine.status === 'PAID' ? 'bg-emerald-500' :
                            fine.status === 'PENDING' ? 'bg-rose-500' :
                            fine.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></span>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {(fine.status === 'PENDING' || fine.status === 'PARTIAL') && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openWaiveModal(fine._id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition"
                            >
                              Waive
                            </button>
                            <Link 
                              to="/payments"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition"
                            >
                              Settle
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Waive Modal */}
      {waiveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Waive Overdue Penalty</span>
              </h2>
              <button onClick={() => setWaiveModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">✕</button>
            </div>
            
            <form onSubmit={handleWaiveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Waiver Rationale
                </label>
                <textarea 
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  placeholder="e.g. Medical dispensation, exam quarantine, administrator authorization..."
                  className="w-full p-3 border border-slate-200/80 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setWaiveModalOpen(false)} 
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={waiveSubmitting} 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {waiveSubmitting ? 'Recording...' : 'Authorize Waiver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Fine Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Issue Disciplinary Fine</span>
              </h2>
              <button onClick={() => setManualModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">✕</button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Member Identification Code</label>
                <input 
                  type="text"
                  value={manualMemberCode}
                  onChange={(e) => setManualMemberCode(e.target.value)}
                  placeholder="e.g. LIB-2026-001"
                  className="w-full p-2.5 border border-slate-200/80 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fine Amount (₹)</label>
                <input 
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="100"
                  min="1"
                  className="w-full p-2.5 border border-slate-200/80 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Violation Reason</label>
                <textarea 
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Lost catalog card, damaged book spine, delayed return..."
                  className="w-full p-2.5 border border-slate-200/80 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setManualModalOpen(false)} 
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={manualSubmitting} 
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {manualSubmitting ? 'Issuing...' : 'Create Fine Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Fines;
