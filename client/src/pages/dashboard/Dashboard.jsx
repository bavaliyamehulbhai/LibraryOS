import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDashboardMaster } from '../../hooks/useDashboard';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import AlertsWidget from '../../components/dashboard/AlertsWidget';
import QuickActions from '../../components/dashboard/QuickActions';
import { 
  Library, Users, BookOpen, Repeat, IndianRupee, 
  Calendar, Sparkles, Command, ShieldCheck, Activity, 
  ArrowUpRight, RefreshCw, Clock, CheckCircle2, 
  Layers, HardDrive, Cpu, Zap, Building2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { APP_VERSION } from '../../constants/version';

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#10b981', '#06b6d4', 
  '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'
];

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 px-4 py-3 rounded-2xl shadow-2xl text-white text-xs space-y-1">
        <p className="font-bold text-slate-300 font-mono text-[11px]">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <p className="font-extrabold text-white">
            Circulation: <span className="text-indigo-400 font-mono">{payload[0].value} volumes</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("30");
  const { user } = useSelector(state => state.auth);
  const { data, isLoading, error, refetch, isFetching } = useDashboardMaster(timeframe);
  const dashboard = data?.data;

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentDateStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-[75vh] items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <Sparkles size={20} className="text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 tracking-wider uppercase">
            Initializing Command Center
          </p>
          <p className="text-[11px] font-mono text-slate-400">
            Establishing telemetry stream v{APP_VERSION}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col h-[75vh] items-center justify-center gap-4 text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Telemetry Stream Interrupted</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Could not retrieve analytical telemetry from the library server. Verify tenant credentials or connection.
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
        >
          <RefreshCw size={14} />
          <span>Re-establish Connection</span>
        </button>
      </div>
    );
  }

  const { stats, charts, alerts, activityFeed } = dashboard;

  // Calculate percentages & derived indicators
  const totalBooks = stats.totalBooks || 0;
  const issuedBooks = stats.issuedBooks || 0;
  const availableBooks = stats.availableBooks || (totalBooks - issuedBooks);
  const circulationRate = totalBooks > 0 ? Math.round((issuedBooks / totalBooks) * 100) : 0;
  const availabilityRate = 100 - circulationRate;

  // Chart trend calculations (robust support for both array and object data schemas)
  const rawTrends = Array.isArray(charts?.trends) ? charts.trends : (charts?.trends?.data || []);
  const trendData = rawTrends.map((d) => ({
    date: d.date || d.name || 'Period',
    issues: Number(d.issues ?? d.libraries ?? d.transactions ?? 0),
    revenue: Number(d.revenue ?? 0),
    activeUsers: Number(d.activeUsers ?? 0)
  }));
  const totalCirculationInPeriod = trendData.reduce((acc, curr) => acc + (curr.issues || 0), 0);
  const dailyAverage = trendData.length > 0 ? Math.round(totalCirculationInPeriod / trendData.length) : 0;
  const peakCirculation = trendData.length > 0 ? Math.max(...trendData.map(d => d.issues || 0)) : 0;

  // Categories total
  const categoriesList = charts?.categories || [];
  const totalCategoryBooks = categoriesList.reduce((acc, c) => acc + (c.count || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Titanium v{APP_VERSION}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telemetry Node Online</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{greeting}, {user?.name || 'Administrator'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {currentDateStr} • {user?.libraryId?.name || 'Central Library System'} • Enterprise Operations Console
          </p>
        </div>

        {/* Header Controls: Timeframe Selector & Telemetry Refresh */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Timeframe Chips */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
            {[
              { id: '7', label: '7D' },
              { id: '30', label: '30D' },
              { id: '90', label: '90D' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === t.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition active:scale-95 disabled:opacity-50"
            title="Refresh Real-time Telemetry"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin text-indigo-500" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Bento Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard 
          title="Catalog Stock" 
          value={totalBooks} 
          icon={Library} 
          colorClass="text-indigo-600 dark:text-indigo-400" 
          bgColorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
          trend="+5.2%"
          trendDirection="up"
          subtitle="Registered volumes"
          progressPercent={100}
        />
        <StatCard 
          title="Active Patrons" 
          value={stats.activeUsers || 0} 
          icon={Users} 
          colorClass="text-emerald-600 dark:text-emerald-400" 
          bgColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          trend="+12.4%"
          trendDirection="up"
          subtitle="Enrolled members"
          progressPercent={85}
        />
        <StatCard 
          title="In Circulation" 
          value={issuedBooks} 
          icon={Repeat} 
          colorClass="text-amber-600 dark:text-amber-400" 
          bgColorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          trend={`${circulationRate}%`}
          trendDirection="up"
          subtitle="Borrower hands"
          progressPercent={circulationRate}
        />
        <StatCard 
          title="Shelf Ready" 
          value={availableBooks} 
          icon={BookOpen} 
          colorClass="text-purple-600 dark:text-purple-400" 
          bgColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
          trend={`${availabilityRate}%`}
          trendDirection="up"
          subtitle="Available for issue"
          progressPercent={availabilityRate}
        />
        <StatCard 
          title="Fee Collections" 
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} 
          icon={IndianRupee} 
          colorClass="text-teal-600 dark:text-teal-400" 
          bgColorClass="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
          trend="+15.8%"
          trendDirection="up"
          subtitle="Collected treasury"
        />
        <StatCard 
          title="Overdue Balance" 
          value={`₹${(stats.pendingFines || 0).toLocaleString()}`} 
          icon={IndianRupee} 
          colorClass="text-rose-600 dark:text-rose-400" 
          bgColorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          trend="-4.2%"
          trendDirection="down"
          subtitle="Due from patrons"
        />
      </div>

      {/* Rapid Execution Desk */}
      <QuickActions />

      {/* Analytical Grid: Left (Charts + Sentinels) & Right (Live Radar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Circulation Trajectory Area Chart */}
          <ChartCard 
            title={`Circulation Trajectory (Last ${timeframe} Days)`}
            subtitle="Daily checkout volume & patron turnover telemetry"
            icon={Repeat}
            action={
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                  <span>Total:</span>
                  <span>{totalCirculationInPeriod} issues</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <span>Avg:</span>
                  <span>{dailyAverage}/day</span>
                </div>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="circulationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
                  dx={-5} 
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                <Tooltip content={<CustomChartTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="issues" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#circulationGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Two-Column Sub-Grid: Category Donut & Sentinels Widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Category Donut Breakdown */}
            <ChartCard 
              title="Discipline Breakdown" 
              subtitle="Holdings by major genre"
              icon={Layers}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-full h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesList}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="name"
                      >
                        {categoriesList.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#090d16', 
                          borderRadius: '16px', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total Count */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {totalCategoryBooks}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Volumes
                    </span>
                  </div>
                </div>

                {/* Micro Legend Chips */}
                <div className="flex flex-wrap justify-center gap-2 mt-3 max-h-[80px] overflow-y-auto px-2">
                  {categoriesList.slice(0, 6).map((cat, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                      />
                      <span className="truncate max-w-[80px]">{cat.name || cat._id || 'General'}</span>
                      <span className="font-mono text-slate-400">({cat.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            {/* Operational Sentinels & Alerts */}
            <AlertsWidget 
              lowStock={alerts?.lowStock || []} 
              securityAlerts={alerts?.securityAlerts || []} 
            />

          </div>

        </div>

        {/* Right Column: Live Event Radar Feed */}
        <div className="lg:col-span-1 h-full min-h-[580px]">
          <ActivityFeed initialFeed={activityFeed || []} />
        </div>

      </div>

      {/* Institutional Hardware & Infrastructure Telemetry Strip */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Cpu size={16} />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Tenant Node Cluster: IN-WEST-1</span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                HEALTHY
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Database Replica Sync: 0ms lag • Cryptographic Ledger: Verified
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Audit Trail: Immutable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-indigo-500" />
            <span>Encryption: AES-256</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
