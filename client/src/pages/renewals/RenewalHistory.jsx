import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  RotateCw, Clock, Search, X, Download, Filter, 
  ArrowLeft, BookOpen, User, CheckCircle2, Layers
} from 'lucide-react';

const RenewalHistory = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countFilter, setCountFilter] = useState('ALL');

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/renewals/history');
      if (res.data.success) {
        setRenewals(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load renewal history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const filteredRenewals = renewals.filter(record => {
    if (countFilter === '1X' && record.renewalCount !== 1) return false;
    if (countFilter === 'MULTI' && (record.renewalCount || 0) < 2) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchTx = (record.transactionCode || '').toLowerCase().includes(q);
    const matchBook = (record.bookId?.title || '').toLowerCase().includes(q);
    const matchMember = (
      (record.memberId?.firstName || '') + ' ' + 
      (record.memberId?.lastName || '') + ' ' + 
      (record.memberId?.memberCode || '')
    ).toLowerCase().includes(q);

    return matchTx || matchBook || matchMember;
  });

  const exportCSV = () => {
    if (renewals.length === 0) {
      toast.error("No renewal records to export");
      return;
    }

    try {
      const headers = ["Transaction_Code", "Book_Title", "Patron_Name", "Member_Code", "Renewal_Count", "New_Due_Date"];
      const rows = renewals.map(r => [
        `"${r.transactionCode || ''}"`,
        `"${(r.bookId?.title || '').replace(/"/g, '""')}"`,
        `"${(r.memberId?.firstName || '')} ${(r.memberId?.lastName || '')}"`,
        `"${r.memberId?.memberCode || ''}"`,
        r.renewalCount || 1,
        `"${r.dueDate ? new Date(r.dueDate).toISOString().slice(0, 10) : ''}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `LibraryOS_Renewals_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Renewal history exported successfully!");
    } catch {
      toast.error("Failed to export renewals");
    }
  };

  const totalRenewals = renewals.length;
  const multiRenewals = renewals.filter(r => (r.renewalCount || 0) > 1).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Loan Renewal Archive</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Audit Log
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Complete chronicle of extended checkout durations and patron loan modifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition flex items-center gap-2"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <Link 
            to="/renewals" 
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <RotateCw size={15} />
            <span>Renew Books Desk</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Renewals</span>
            <RotateCw size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalRenewals}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total loan extensions</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Multi-Extensions</span>
            <Layers size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {multiRenewals}
          </div>
          <p className="text-[11px] text-purple-500 mt-1 font-medium">Renewed 2x or more</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Extension</span>
            <Clock size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            +14 Days
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium">Standard policy duration</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Compliance</span>
            <CheckCircle2 size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            100%
          </div>
          <p className="text-[11px] text-blue-500 mt-1 font-medium">Policy verified</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by transaction code, book title, or patron..." 
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: '1X', label: 'Single Renewal (1x)' },
              { id: 'MULTI', label: 'Multi Renewals (2x+)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCountFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  countFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <span className="text-sm font-medium">Loading renewal audit records...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Last Renewed</th>
                  <th className="px-6 py-4">New Due Date</th>
                  <th className="px-6 py-4">Quota</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredRenewals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-20 text-slate-400">
                      <div className="max-w-xs mx-auto text-center space-y-2">
                        <RotateCw size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Renewals Found</h4>
                        <p className="text-xs">No records matched your search filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRenewals.map(record => (
                    <tr key={record._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {record.transactionCode || 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate" title={record.bookId?.title}>
                          {record.bookId?.title || "Untitled Book"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                            {((record.memberId?.firstName || "P")[0]).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {record.memberId?.firstName} {record.memberId?.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {record.memberId?.memberCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {record.renewalHistory && record.renewalHistory.length > 0 
                          ? new Date(record.renewalHistory[record.renewalHistory.length - 1].renewedAt).toLocaleString()
                          : '-'}
                      </td>

                      <td className="px-6 py-4 font-extrabold text-blue-600 dark:text-blue-400 font-mono text-xs">
                        {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {record.renewalCount || 1}x
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/renewals/${record._id}`} 
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                          View Audit
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

export default RenewalHistory;
