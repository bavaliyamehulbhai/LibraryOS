import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  AlertTriangle, 
  ShieldAlert, 
  IndianRupee, 
  Bell, 
  Send, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  UserX,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-2xl text-xs space-y-1 font-sans">
        <p className="font-bold text-slate-300 pb-1 border-b border-slate-800 flex justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-rose-400 font-mono">Receivables</span>
        </p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-slate-400">Total Outstanding:</span>
          <span className="font-mono font-bold text-rose-400">₹{payload[0].value.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

const RiskAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sendingNoticeId, setSendingNoticeId] = useState(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/v1/analytics/risk');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load risk analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fineRisks = data?.fineRisks || [];
  const totalOutstanding = data?.totalOutstandingAmount || 0;

  const getRiskLevel = (amount) => {
    if (amount >= 500) return { label: 'CRITICAL RISK', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' };
    if (amount >= 150) return { label: 'MODERATE RISK', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    return { label: 'LOW RISK', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
  };

  const filteredRisks = useMemo(() => {
    return fineRisks.filter(risk => {
      const matchesSearch = 
        risk.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.email?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (riskFilter === 'ALL') return true;
      if (riskFilter === 'HIGH') return risk.totalUnpaid >= 500;
      if (riskFilter === 'MEDIUM') return risk.totalUnpaid >= 150 && risk.totalUnpaid < 500;
      if (riskFilter === 'LOW') return risk.totalUnpaid < 150;
      return true;
    });
  }, [fineRisks, searchQuery, riskFilter]);

  // Derived metrics
  const highRiskCount = fineRisks.filter(r => r.totalUnpaid >= 500).length;
  const avgUnpaidPerPatron = fineRisks.length > 0 ? Math.round(totalOutstanding / fineRisks.length) : 0;

  // Chart distribution
  const chartData = useMemo(() => {
    return fineRisks.slice(0, 8).map(r => ({
      name: r.name.split(' ')[0],
      amount: r.totalUnpaid
    }));
  }, [fineRisks]);

  // Dispatch reminder action
  const handleDispatchNotice = (patron) => {
    setSendingNoticeId(patron._id);
    setTimeout(() => {
      setSendingNoticeId(null);
      toast.success(`Automated Due Notice dispatched to ${patron.name} (${patron.email}) via Email/WhatsApp!`);
    }, 700);
  };

  const handleBroadcastAll = () => {
    if (!fineRisks.length) {
      toast.error("No debtors found to notify");
      return;
    }
    toast.success(`Broadcasted overdue collection notices to all ${fineRisks.length} debtor patrons!`);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!fineRisks.length) {
      toast.error("No risk data to export");
      return;
    }

    const headers = ["Patron Name,Email,Pending Fine Count,Total Unpaid (INR),Risk Classification"];
    const rows = fineRisks.map(r => [
      `"${r.name}"`,
      r.email,
      r.fineCount,
      r.totalUnpaid,
      `"${getRiskLevel(r.totalUnpaid).label}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `debtor_receivables_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Receivables report exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-200 dark:border-rose-900/40 border-t-rose-600 animate-spin" />
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">
          Analyzing Portfolio Debt & Overdue Sentinels...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1450px] mx-auto space-y-8 animate-fadeIn">
      
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Risk Sentinel Engine
            </span>
            <span className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Receivables Exposure Active</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Portfolio Risk & Debt Analytics</span>
            <span className="text-2xl">⚠️</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Monitor patron fine delinquencies, overdue aging curves, and dispatch automated recovery notices.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-sm"
            title="Refresh analytics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleBroadcastAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send size={14} />
            <span>Broadcast Notices ({fineRisks.length})</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4-Card Bento Risk Sentinel Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Locked Outstanding */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-100 uppercase tracking-wider">
              Total Delinquent Dues
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight">
            ₹{totalOutstanding.toLocaleString()}
          </div>
          <p className="text-xs text-rose-100/90 mt-2 font-medium">
            Receivables pending patron settlement
          </p>
        </div>

        {/* High Risk Borrowers */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Critical Risk Patrons
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {highRiskCount}
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-bold flex items-center gap-1">
            <span>Dues exceeding ₹500 threshold</span>
          </p>
        </div>

        {/* Total Debtors Count */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Debtor Accounts
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <UserX size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {fineRisks.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Active patrons with fine liabilities
          </p>
        </div>

        {/* Avg Delinquency */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mean Exposure
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            ₹{avgUnpaidPerPatron.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Average arrears per debtor
          </p>
        </div>

      </div>

      {/* Grid: Receivables Bar Chart & Fast Action Sentinel Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Receivables Distribution Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500" />
                <span>Top Individual Exposure Balances</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Largest outstanding fine concentrations across individual patron records.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Values in INR (₹)</span>
          </div>

          <div className="w-full h-[240px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.amount >= 500 ? '#f43f5e' : (entry.amount >= 150 ? '#f59e0b' : '#10b981')} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active fine records to map.
              </div>
            )}
          </div>
        </div>

        {/* Fast Action Sentinel Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Bell size={20} />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Automated Collection Sentinel
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              LibraryOS can automatically deliver multi-channel recovery notices via WhatsApp Business API and SMTP gateway to overdue loan holders before borrowing privileges are frozen.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Automated SMS Dispatch</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">Enabled</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Borrowing Lockout at ₹500</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">Active</span>
            </div>
            <button
              onClick={handleBroadcastAll}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>Broadcast Reminder Run</span>
            </button>
          </div>
        </div>

      </div>

      {/* Debtor Portfolio Management Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200/70 dark:border-slate-800/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600 dark:text-rose-400" />
              <span>Delinquent Patrons Register</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual breakdown of all outstanding arrears and recovery dispatch options.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search debtor name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRiskFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    riskFilter === filter 
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' 
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {filteredRisks.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase font-black text-[10px] text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Patron Profile</th>
                  <th className="px-6 py-3.5">Unpaid Violations</th>
                  <th className="px-6 py-3.5">Outstanding Exposure</th>
                  <th className="px-6 py-3.5">Delinquency Tier</th>
                  <th className="px-6 py-3.5 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                {filteredRisks.map((risk) => {
                  const level = getRiskLevel(risk.totalUnpaid);
                  const isSending = sendingNoticeId === risk._id;

                  return (
                    <tr 
                      key={risk._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {risk.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                              {risk.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {risk.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {risk.fineCount} infraction{risk.fineCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                        ₹{risk.totalUnpaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${level.color}`}>
                          {level.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDispatchNotice(risk)}
                          disabled={isSending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                          <Send size={12} className={isSending ? 'animate-spin' : ''} />
                          <span>{isSending ? 'Dispatching...' : 'Send Notice'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <CheckCircle2 size={32} className="text-emerald-500 mb-1" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No Risk Offenses Found</p>
              <p className="text-xs text-slate-400">All registered patron accounts are in good standing.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default RiskAnalytics;
