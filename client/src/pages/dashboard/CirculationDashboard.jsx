import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Calendar, Book, Users, Clock, AlertTriangle, 
  IndianRupee, FileText, CalendarCheck, Activity, 
  ArrowUpRight, ArrowDownLeft, Sparkles, Radio 
} from 'lucide-react';
import { APP_VERSION } from '../../constants/version';

const CirculationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/v1/circulation-dashboard'),
          api.get(`/v1/circulation-dashboard/charts?days=${timeframe}`)
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (chartsRes.data.success) setChartData(chartsRes.data.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Loading Circulation Command Center v{APP_VERSION}...
        </p>
      </div>
    );
  }

  const healthScore = stats ? Math.max(0, 100 - ((stats.overdueBooks || 0) * 2) - ((stats.pendingFines || 0) / 1000)) : 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Circulation Desk v{APP_VERSION}
            </span>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Circulation Active</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Circulation Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time telemetry on book issues, returns, reservations, and library inventory health.
          </p>
        </div>

        {/* Action Controls & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select 
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2 pl-8 pr-7 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold shadow-sm cursor-pointer"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <Calendar className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" size={14} />
          </div>

          <Link 
            to="/issues/new" 
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <ArrowUpRight size={14} />
            <span>Issue Book</span>
          </Link>

          <Link 
            to="/returns/new" 
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
          >
            <ArrowDownLeft size={14} />
            <span>Return Book</span>
          </Link>

          <Link 
            to="/circulation/feed" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/50 transition"
          >
            <Radio size={14} className="animate-pulse" />
            <span>Live Feed</span>
          </Link>
        </div>
      </div>

      {/* Top 7 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { title: "Total Books", value: stats?.totalBooks || 0, icon: Book, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/60" },
          { title: "Members", value: stats?.totalMembers || 0, icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
          { title: "Active Issues", value: stats?.activeIssues || 0, icon: Clock, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/60" },
          { title: "Overdue", value: stats?.overdueBooks || 0, icon: AlertTriangle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60" },
          { title: "Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/60" },
          { title: "Pending Fines", value: `₹${(stats?.pendingFines || 0).toLocaleString()}`, icon: FileText, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" },
          { title: "Reservations", value: stats?.pendingReservations || 0, icon: CalendarCheck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60" },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="glass-card rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</h2>
                <p className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5 uppercase">{kpi.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Chart & Health Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Circulation Trends (Last {timeframe} Days)</span>
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Issues
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Returns
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="issues" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} name="Issues" />
                <Line type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Returns" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Library Health Score Gauge */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Health Telemetry
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Live Audit
            </span>
          </div>
          
          <div className="relative w-44 h-44 flex items-center justify-center my-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
              <circle 
                cx="88" 
                cy="88" 
                r="72" 
                stroke="currentColor" 
                strokeWidth="12" 
                fill="transparent" 
                strokeLinecap="round"
                strokeDasharray="452" 
                strokeDashoffset={452 - (452 * healthScore) / 100}
                className={`transition-all duration-1000 ease-out ${healthScore > 80 ? 'text-emerald-500' : healthScore > 50 ? 'text-amber-500' : 'text-rose-500'}`} 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${healthScore > 80 ? 'text-emerald-600 dark:text-emerald-400' : healthScore > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {Math.round(healthScore)}
              </span>
              <span className="text-xs font-semibold text-slate-400 tracking-wider">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-center font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 w-full">
            {healthScore > 80 ? "Library operations running optimal 🚀" : "Attention needed on overdues or fines ⚠️"}
          </p>
        </div>

      </div>
    </div>
  );
};

export default CirculationDashboard;

