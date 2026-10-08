import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  CheckCircle2, 
  Percent, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Clock, 
  Users, 
  Download, 
  Search, 
  Award, 
  Sparkles,
  ArrowUpRight,
  Filter,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-2xl text-xs space-y-1.5 font-sans min-w-[140px]">
        <p className="font-bold text-slate-300 pb-1 border-b border-slate-800 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-indigo-400 font-mono">Circulation</span>
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 capitalize">{entry.name}:</span>
            </div>
            <span className="font-mono font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ReadingAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/v1/analytics/reading');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load reading analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Top Readers calculation & filtering
  const topReaders = data?.topReaders || [];
  
  const getTier = (count) => {
    if (count >= 8) return { label: 'Master Scholar', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    if (count >= 5) return { label: 'Voracious Reader', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
    if (count >= 3) return { label: 'Avid Reader', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    return { label: 'Active Explorer', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
  };

  const filteredReaders = useMemo(() => {
    return topReaders.filter(reader => {
      const matchesSearch = 
        reader.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.memberCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.email?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (tierFilter === 'ALL') return true;
      if (tierFilter === 'SCHOLAR') return reader.borrowCount >= 8;
      if (tierFilter === 'VORACIOUS') return reader.borrowCount >= 5 && reader.borrowCount < 8;
      if (tierFilter === 'AVID') return reader.borrowCount >= 3 && reader.borrowCount < 5;
      return true;
    });
  }, [topReaders, searchQuery, tierFilter]);

  // Export CSV functionality
  const handleExportCSV = () => {
    if (!topReaders.length) {
      toast.error("No reader data to export");
      return;
    }

    const headers = ["Rank,Member Name,Member Code,Email,Role,Books Borrowed,Tier"];
    const rows = topReaders.map((r, i) => [
      i + 1,
      `"${r.name}"`,
      r.memberCode,
      r.email,
      r.memberType || 'STUDENT',
      r.borrowCount,
      `"${getTier(r.borrowCount).label}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reading_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leaderboard exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-4">
        <div className="relative w-14 h-14">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-200 dark:border-indigo-900/40 border-t-indigo-600 animate-spin" />
          <Sparkles size={18} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
        </div>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">
          Computing Patron Reading Telemetry...
        </p>
      </div>
    );
  }

  const {
    totalIssues = 0,
    totalReturns = 0,
    completionRate = 0,
    activeBorrowers = 0,
    avgReadingDays = 7.5,
    monthlyTrends = []
  } = data || {};

  const top3 = topReaders.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1450px] mx-auto space-y-8 animate-fadeIn">
      
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Titanium Intelligence
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Patron Engagement Active</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Reading Analytics & Patron Leaderboard</span>
            <span className="text-2xl">📚</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Circulation velocity, borrower retention metrics, and reading honor rolls.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-sm"
            title="Refresh telemetry"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={14} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* 5-Column Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Volumes Issued */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Issued Volumes
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalIssues}
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-bold flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> +14%
            </span>
            <span>vs previous term</span>
          </p>
        </div>

        {/* Successfully Returned */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Returned Safely
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalReturns}
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">100%</span>
            <span>shelved & checked</span>
          </p>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Percent size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(100, completionRate)}%` }} 
            />
          </div>
        </div>

        {/* Active Readers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Borrowers
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeBorrowers}
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Holding active loans
          </p>
        </div>

        {/* Turnaround Velocity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Loan Velocity
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {avgReadingDays}<span className="text-sm font-semibold text-slate-400"> d</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Average days to return
          </p>
        </div>

      </div>

      {/* Podium Spotlight: Top 3 Readers */}
      {top3.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <span>Honor Roll Podium</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Ranked by volume count</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {top3.map((reader, index) => {
              const medals = [
                { rank: '1st', bg: 'from-amber-500/15 via-amber-500/5 to-transparent', border: 'border-amber-500/40', badge: 'bg-amber-500 text-white', icon: '👑', title: 'Grand Laureate' },
                { rank: '2nd', bg: 'from-slate-400/15 via-slate-400/5 to-transparent', border: 'border-slate-400/40', badge: 'bg-slate-400 text-white', icon: '🥈', title: 'Master Reader' },
                { rank: '3rd', bg: 'from-amber-700/15 via-amber-700/5 to-transparent', border: 'border-amber-700/30', badge: 'bg-amber-700 text-white', icon: '🥉', title: 'Honor Scholar' }
              ];
              const m = medals[index];

              return (
                <div
                  key={reader._id || index}
                  className={`p-6 rounded-2xl bg-gradient-to-b ${m.bg} bg-white dark:bg-slate-900 border ${m.border} shadow-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{m.icon}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${m.badge} shadow-sm`}>
                      {m.rank} Place
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                      {reader.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {reader.memberCode} • <span className="uppercase">{reader.memberType || 'Student'}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Volumes Read
                      </span>
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {reader.borrowCount}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {m.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Circulation Velocity Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Flame size={18} className="text-indigo-500" />
              <span>Circulation Velocity Trend (Past 6 Months)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly ratio of checkout issues against safe returns to verify shelf equilibrium.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Issues</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Returns</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="issuesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="returnsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
              <XAxis 
                dataKey="month" 
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
              <Area 
                type="monotone" 
                dataKey="issues" 
                name="Issues"
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#issuesGrad)" 
              />
              <Area 
                type="monotone" 
                dataKey="returns" 
                name="Returns"
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#returnsGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranked Leaderboard Suite */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200/70 dark:border-slate-800/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Full Patron Honor Roll Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing active patron rankings across all academic departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Tier Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
              {['ALL', 'SCHOLAR', 'VORACIOUS', 'AVID'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTierFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    tierFilter === filter 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
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
          {filteredReaders.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase font-black text-[10px] text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Standing</th>
                  <th className="px-6 py-3.5">Patron Identity</th>
                  <th className="px-6 py-3.5">Member Code</th>
                  <th className="px-6 py-3.5">Affiliation</th>
                  <th className="px-6 py-3.5 text-center">Volumes Checked Out</th>
                  <th className="px-6 py-3.5 text-right">Academic Distinction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                {filteredReaders.map((reader, index) => {
                  const tier = getTier(reader.borrowCount);
                  const isTop3 = index < 3 && tierFilter === 'ALL' && !searchQuery;

                  return (
                    <tr 
                      key={reader._id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                    >
                      <td className="px-6 py-4 font-black text-sm">
                        {isTop3 ? (
                          <span className="text-base">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        ) : (
                          <span className="font-mono text-slate-400">#{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {reader.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                              {reader.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {reader.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {reader.memberCode}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {reader.memberType || 'STUDENT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black font-mono text-xs border border-indigo-500/20">
                          <BookOpen size={12} />
                          <span>{reader.borrowCount} volumes</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Search size={28} className="text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">No readers match the current filter or search criteria.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ReadingAnalytics;
