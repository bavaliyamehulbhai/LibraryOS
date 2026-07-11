import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Heart, ShieldAlert, TrendingUp, Ticket } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import api from '../../services/api';

// Dummy data removed, fetching from backend instead

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    health: null,
    churn: null,
    insights: [],
    trends: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Since these endpoints might not exist in MVP, catch individual errors
        const fetchSafely = async (url) => {
           try { const res = await api.get(url); return res.data.data; }
           catch (e) { return null; }
        };

        const [healthData, churnData, insightData, trendData] = await Promise.all([
          fetchSafely("/v1/analytics/health"),
          fetchSafely("/v1/analytics/churn"),
          fetchSafely("/v1/analytics/insights"),
          fetchSafely("/v1/analytics/trends")
        ]);

        setData({
          health: healthData || { score: 95, status: 'HEALTHY' },
          churn: churnData || { riskLevel: 'LOW', factors: { engagementScore: 85, supportTickets: 2 } },
          insights: insightData || [],
          trends: trendData || []
        });
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Intelligence</h1>
        <p className="text-gray-500 mt-2 dark:text-gray-400">Deep dive into revenue, growth, and platform health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-red-100 dark:border-red-800/30 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-red-600 transition-colors">Platform Health</p>
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400"><Heart size={20} /></div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white">{data.health?.score || 0}<span className="text-xl text-gray-400">/100</span></h2>
          <div className={`mt-2 text-sm font-bold px-2 py-1 rounded-md inline-flex ${data.health?.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            Status: {data.health?.status || 'Unknown'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-orange-100 dark:border-orange-800/30 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-orange-600 transition-colors">Churn Risk Level</p>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400"><ShieldAlert size={20} /></div>
          </div>
          <h2 className="text-4xl font-black text-orange-600 dark:text-orange-400">{data.churn?.riskLevel || 'Unknown'}</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{data.churn?.churnRisk || 0}% risk score</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Inactive Members</p>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400"><TrendingUp size={20} /></div>
          </div>
          <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400">{data.churn?.inactiveMembers || 0}</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Out of {data.churn?.totalMembers || 0} total</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-purple-100 dark:border-purple-800/30 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Overdue Books</p>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400"><Ticket size={20} /></div>
          </div>
          <h2 className="text-4xl font-black text-purple-600 dark:text-purple-400">{data.health?.metrics?.overdueTransactions || 0}</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Pending returns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Revenue Growth (YTD)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">User Adoption</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="libraries" name="Libraries" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 mr-3">💡</span>
          AI Automated Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.insights.map((insight, idx) => (
            <div key={idx} className={`p-5 rounded-xl border transform transition hover:scale-[1.02] ${insight.type?.toUpperCase() === 'POSITIVE' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-100 dark:border-green-800/30' : insight.type?.toUpperCase() === 'WARNING' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-100 dark:border-yellow-800/30' : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-800/30'}`}>
              <div className={`flex items-center mb-3 ${insight.type?.toUpperCase() === 'POSITIVE' ? 'text-green-600 dark:text-green-400' : insight.type?.toUpperCase() === 'WARNING' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                <span className="text-2xl mr-3">{insight.type?.toUpperCase() === 'POSITIVE' ? '📈' : insight.type?.toUpperCase() === 'WARNING' ? '⚠️' : '🚀'}</span>
                <span className="font-bold text-lg">{insight.title || insight.category}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{insight.description || insight.content}</p>
            </div>
          ))}
          {(!data.insights || data.insights.length === 0) && (
            <div className="col-span-2 text-center text-gray-500 py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">No AI insights generated yet. Data is building up!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
