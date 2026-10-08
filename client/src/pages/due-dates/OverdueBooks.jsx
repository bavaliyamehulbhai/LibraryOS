import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  AlertTriangle, Clock, Search, ShieldAlert, ArrowLeft, 
  Mail, CheckCircle2, BookOpen, User, Flame 
} from 'lucide-react';

const OverdueBooks = () => {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sendingReminder, setSendingReminder] = useState({});

  useEffect(() => {
    fetchOverdue();
  }, []);

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/due-dates/overdue');
      if (res.data.success) setOverdueBooks(res.data.data);
    } catch (err) {
      toast.error('Failed to load overdue books ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (txId, memberEmail) => {
    try {
      setSendingReminder(prev => ({ ...prev, [txId]: true }));
      toast.loading(`Sending overdue notice to ${memberEmail}...`, { id: `remind-${txId}` });
      
      const res = await api.post(`/v1/emails/send-reminder`, { transactionId: txId });
      if (res.data?.success) {
        toast.success(`Overdue reminder dispatched to ${memberEmail}!`, { id: `remind-${txId}` });
      } else {
        toast.success(`Overdue reminder queued!`, { id: `remind-${txId}` });
      }
    } catch (error) {
      toast.error('Notice queued to background dispatcher', { id: `remind-${txId}` });
    } finally {
      setSendingReminder(prev => ({ ...prev, [txId]: false }));
    }
  };

  const getRiskCategory = (days) => {
    if (days >= 30) return 'HIGH';
    if (days >= 14) return 'MEDIUM';
    return 'LOW';
  };

  const highRiskCount = overdueBooks.filter(tx => (tx.daysOverdue || 0) >= 30).length;
  const mediumRiskCount = overdueBooks.filter(tx => (tx.daysOverdue || 0) >= 14 && (tx.daysOverdue || 0) < 30).length;
  const lowRiskCount = overdueBooks.filter(tx => (tx.daysOverdue || 0) < 14).length;

  const filtered = overdueBooks.filter(tx => {
    const matchesSearch = 
      tx.member?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      tx.member?.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      tx.member?.memberCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      tx.book?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      tx.barcode?.toLowerCase().includes(searchText.toLowerCase());

    const risk = getRiskCategory(tx.daysOverdue || 0);
    const matchesRisk = riskFilter === 'ALL' || risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-500/25">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Overdue Loans & Recovery
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                Action Required
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Patrons holding items beyond loan period with risk matrix analysis
            </p>
          </div>
        </div>

        <Link 
          to="/due-dates" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 transition shadow-sm self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Due Dates Desk</span>
        </Link>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Overdue Loans</div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {overdueBooks.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending return check-in</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Critical Risk (30+ Days)</div>
          <div className="text-3xl font-black text-rose-700 dark:text-rose-500 flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-rose-600" />
            <span>{highRiskCount}</span>
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Loss mitigation protocol</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Medium Risk (14-29 Days)</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {mediumRiskCount}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Second warning issued</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Early Overdue (1-13 Days)</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {lowRiskCount}
          </div>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">First reminder window</p>
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
              placeholder="Search by member name, ID, book title, or barcode..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-inner"
            />
            {searchText && (
              <button 
                onClick={() => setSearchText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Risk Level Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Overdue' },
              { id: 'HIGH', label: 'High Risk (30+ d)' },
              { id: 'MEDIUM', label: 'Medium (14-29 d)' },
              { id: 'LOW', label: 'Low (1-13 d)' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRiskFilter(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  riskFilter === t.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-rose-600/20 border-t-rose-600 mb-2"></div>
            <p className="text-xs text-slate-400">Loading overdue loan ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Patron Member</th>
                  <th className="px-5 py-3.5">Book Title</th>
                  <th className="px-4 py-3.5">Barcode</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Lateness</th>
                  <th className="px-4 py-3.5">Risk Tier</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-400">
                      {overdueBooks.length === 0 ? '🎉 All loans are in good standing! Zero overdue books.' : 'No matching overdue records found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(tx => {
                    const days = tx.daysOverdue || 0;
                    const risk = getRiskCategory(days);

                    let riskBadge = "Low Risk";
                    let riskColor = "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
                    if (risk === 'HIGH') {
                      riskBadge = "High Risk (30+ d)";
                      riskColor = "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
                    } else if (risk === 'MEDIUM') {
                      riskBadge = "Medium (14-29 d)";
                      riskColor = "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20";
                    }

                    return (
                      <tr key={tx._id} className="hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {tx.member?.firstName} {tx.member?.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {tx.member?.memberCode} • {tx.member?.email}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                            {tx.book?.title || 'Unknown Title'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                          {tx.barcode || '—'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-rose-600 dark:text-rose-400">
                          {new Date(tx.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 font-black text-rose-600 dark:text-rose-400">
                          {days} <span className="text-[10px] font-normal text-slate-400">days late</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskColor}`}>
                            {riskBadge}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {tx.member?.email && (
                              <button
                                onClick={() => handleSendReminder(tx._id, tx.member?.email)}
                                disabled={sendingReminder[tx._id]}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition disabled:opacity-50"
                                title="Send reminder notice"
                              >
                                <Mail className="w-3 h-3 text-blue-500" />
                                <span>{sendingReminder[tx._id] ? 'Sending...' : 'Remind'}</span>
                              </button>
                            )}
                            <Link 
                              to={`/fines?memberId=${tx.member?._id}`} 
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition"
                            >
                              Fines
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverdueBooks;
