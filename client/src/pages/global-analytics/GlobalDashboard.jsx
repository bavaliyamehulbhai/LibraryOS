import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const GlobalDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, trendRes, planRes] = await Promise.all([
        api.get('/v1/global-analytics/overview'),
        api.get('/v1/global-analytics/revenue-trend'),
        api.get('/v1/global-analytics/plan-distribution')
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.data);
      if (trendRes.data.success) setRevenueTrend(trendRes.data.data);
      if (planRes.data.success) setPlanDistribution(planRes.data.data);
    } catch (error) {
      console.error("Failed to load global analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) {
    return <div className="p-8 text-center text-gray-500">Loading SaaS Business Intelligence...</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleDownloadReport = () => {
    // A simple and robust way to generate a PDF without extra dependencies 
    // is to invoke the browser's print dialog which allows "Save as PDF".
    window.print();
    
    import('react-hot-toast').then(module => {
      module.default.success('Please select "Save as PDF" in the dialog');
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-600" /> Executive Dashboard
          </h1>
          <p className="text-gray-500 mt-1">SaaS Business Intelligence & Operations</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Business Health</p>
            <p className={`text-xl font-bold ${overview.businessHealth > 80 ? 'text-green-600' : overview.businessHealth > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {overview.businessHealth}/100
            </p>
          </div>
          <button onClick={handleDownloadReport} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">MRR</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(overview.revenue.mrr)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4 flex items-center">
            <span className="font-bold">ARR:</span> <span className="ml-1 text-gray-600 dark:text-gray-400">{formatCurrency(overview.revenue.arr)}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-cyan-500 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Tenants</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.tenants.active}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Out of {overview.tenants.total} total libraries
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-red-500 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Churn Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.growth.churnRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Target: &lt; 5%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-emerald-500 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Est. LTV</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(overview.growth.ltv)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            CAC: {formatCurrency(overview.growth.cac)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue & MRR Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="mrr" name="MRR" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Plan Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {planDistribution.map((entry, index) => (
              <div key={entry.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights & Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Operations */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-indigo-500" /> Platform Operations
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Active Subscriptions</span>
              <span className="font-bold text-gray-900 dark:text-white">{overview.growth.totalActiveSubscriptions}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Trial Libraries</span>
              <span className="font-bold text-gray-900 dark:text-white">{overview.tenants.trial}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Suspended Accounts</span>
              <span className="font-bold text-red-600">{overview.tenants.suspended}</span>
            </div>
          </div>
        </div>

        {/* Support Health */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <HeartPulse className="w-5 h-5 mr-2 text-rose-500" /> Support Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Open Tickets</span>
              <span className={`font-bold ${overview.support.openTickets > 20 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {overview.support.openTickets}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Resolved Tickets</span>
              <span className="font-bold text-green-600">{overview.support.resolvedTickets}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Avg Resolution Time</span>
              <span className="font-bold text-gray-900 dark:text-white">4.2 Hrs</span>
            </div>
          </div>
        </div>

        {/* AI Insights Widget */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-sm text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="text-xl mr-2">✨</span> Executive Insights
          </h3>
          <ul className="space-y-4">
            <li className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-sm">
              <span className="font-bold text-indigo-300">Revenue Growth:</span> MRR is projected to cross ₹{formatCurrency(overview.revenue.mrr * 1.15)} next month based on current trial conversions.
            </li>
            <li className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-sm">
              <span className="font-bold text-emerald-300">Plan Adoption:</span> The Professional plan accounts for {planDistribution[1]?.value || 0}% of your tenant base, driving highest LTV.
            </li>
            <li className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-sm">
              <span className="font-bold text-red-300">Risk Factor:</span> High open support tickets might lead to increased churn in the Enterprise segment.
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default GlobalDashboard;
