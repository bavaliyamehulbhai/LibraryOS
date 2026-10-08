import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  History, ArrowDownLeft, Search, Filter, CheckCircle2, 
  AlertTriangle, Eye, ArrowRight, BookOpen, Clock 
} from 'lucide-react';

const ReturnHistory = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/returns');
      if (res.data.success) {
        setReturns(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load return history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const totalCollectedFines = returns.reduce((acc, r) => acc + (r.fineAmount || 0), 0);
  const ontimeReturnsCount = returns.filter(r => (r.lateDays || 0) === 0).length;
  const ontimeRate = returns.length > 0 ? Math.round((ontimeReturnsCount / returns.length) * 100) : 100;

  const filtered = returns.filter(r => {
    const matchesSearch = 
      r.transactionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bookCopyId?.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.memberId?.firstName + ' ' + r.memberId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.memberId?.memberCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCondition = conditionFilter === 'ALL' || r.returnCondition === conditionFilter;
    return matchesSearch && matchesCondition;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Return Audit History
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                Reconciled Loans
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive log of returned books, copy conditions, and late fines assessment
            </p>
          </div>
        </div>

        <Link 
          to="/returns/new" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Check-in New Return</span>
        </Link>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Returns Processed</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {returns.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Reconciled to physical shelves</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">On-Time Return Rate</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{ontimeRate}%</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Returned before due date</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Overdue Returns</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>{returns.length - ontimeReturnsCount}</span>
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Subject to late fines</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Penalties Assessed</div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            ₹{totalCollectedFines.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Damage & late fees generated</p>
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
              placeholder="Search by transaction, book title, barcode, or member..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
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

          {/* Condition Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto overflow-x-auto">
            {['ALL', 'GOOD', 'DAMAGED', 'LOST'].map((cond) => (
              <button
                key={cond}
                onClick={() => setConditionFilter(cond)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  conditionFilter === cond
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-600/20 border-t-emerald-600 mb-2"></div>
            <p className="text-xs text-slate-400">Loading return log...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Transaction</th>
                  <th className="px-5 py-3.5">Book & Barcode</th>
                  <th className="px-5 py-3.5">Patron Member</th>
                  <th className="px-4 py-3.5">Returned On</th>
                  <th className="px-4 py-3.5">Fine Amount</th>
                  <th className="px-4 py-3.5">Copy Condition</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-400">
                      No return transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map(record => (
                    <tr 
                      key={record._id} 
                      className="hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-white/5">
                          {record.transactionCode || record._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {record.bookId?.title || 'Unknown Title'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {record.bookCopyId?.barcode || 'No barcode'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {record.memberId?.firstName} {record.memberId?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {record.memberId?.memberCode}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{new Date(record.actualReturnDate).toLocaleDateString()}</div>
                        {record.lateDays > 0 ? (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            {record.lateDays} days late
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            On time
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold">
                        {record.fineAmount > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">₹{record.fineAmount}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">₹0</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 ${
                          record.returnCondition === 'GOOD'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                          record.returnCondition === 'DAMAGED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            record.returnCondition === 'GOOD' ? 'bg-emerald-500' :
                            record.returnCondition === 'DAMAGED' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {record.returnCondition || 'GOOD'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link 
                          to={`/returns/${record._id}`} 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Receipt</span>
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
    </div>
  );
};

export default ReturnHistory;
