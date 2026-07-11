import React, { useState, useEffect } from 'react';
import { useDashboardMaster } from '../../hooks/useDashboard';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import AlertsWidget from '../../components/dashboard/AlertsWidget';
import QuickActions from '../../components/dashboard/QuickActions';
import { Library, Users, BookOpen, Repeat, AlertTriangle, Search, IndianRupee, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("30");
  const { data, isLoading, error } = useDashboardMaster(timeframe);
  const dashboard = data?.data;

  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center text-gray-400">Loading Command Center...</div>;
  }

  if (error || !dashboard) {
    return <div className="flex h-[80vh] items-center justify-center text-red-500">Failed to load dashboard data.</div>;
  }

  const { stats, charts, alerts, activityFeed } = dashboard;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      
      {/* Header & Global Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Executive Dashboard</h1>
          <p className="text-slate-500">Welcome back to LibraryOS Command Center.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <select 
              className="appearance-none bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 py-3 pl-10 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm cursor-pointer"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
            </select>
            <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
          </div>

          <div className="w-full md:w-80 relative shadow-sm">
            <input 
              type="text" 
              placeholder="Global Search..." 
              className="w-full pl-10 pr-4 py-3 border-slate-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Books" value={stats.totalBooks} icon={Library} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
        <StatCard title="Active Members" value={stats.activeUsers} icon={Users} colorClass="text-green-600" bgColorClass="bg-green-50" />
        <StatCard title="Issued Books" value={stats.issuedBooks} icon={Repeat} colorClass="text-orange-600" bgColorClass="bg-orange-50" />
        <StatCard title="Available" value={stats.availableBooks} icon={BookOpen} colorClass="text-purple-600" bgColorClass="bg-purple-50" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue || 0}`} icon={IndianRupee} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
        <StatCard title="Pending Fines" value={`₹${stats.pendingFines || 0}`} icon={IndianRupee} colorClass="text-rose-600" bgColorClass="bg-rose-50" />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Grid: Charts & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts (takes 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title={`Circulation Trend (Last ${timeframe} Days)`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.trends.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Area type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIssues)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Category Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {charts.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            
            <AlertsWidget lowStock={alerts.lowStock} securityAlerts={alerts.securityAlerts} />
          </div>
        </div>

        {/* Right Column: Activity Feed (takes 1 col on lg) */}
        <div className="lg:col-span-1 h-[800px]">
          <ActivityFeed initialFeed={activityFeed} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
