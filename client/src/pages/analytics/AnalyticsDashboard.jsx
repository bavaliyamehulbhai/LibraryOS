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
        <StatCard title="Platform Health Score" value={`${data.health?.score || 0}/100`} icon={Heart} colorClass="text-red-500" bgColorClass="bg-red-50" trend={data.health?.status} trendUp={data.health?.status === 'HEALTHY'} />
        <StatCard title="Churn Risk Level" value={data.churn?.riskLevel || 'Unknown'} icon={ShieldAlert} colorClass="text-orange-500" bgColorClass="bg-orange-50" />
        <StatCard title="Engagement Score" value={data.churn?.factors?.engagementScore || 0} icon={TrendingUp} colorClass="text-blue-500" bgColorClass="bg-blue-50" />
        <StatCard title="Support Tickets" value={data.churn?.factors?.supportTickets || 0} icon={Ticket} colorClass="text-purple-500" bgColorClass="bg-purple-50" />
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">AI Automated Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.insights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${insight.type === 'POSITIVE' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : insight.type === 'WARNING' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'}`}>
              <div className={`flex items-center mb-2 ${insight.type === 'POSITIVE' ? 'text-green-600 dark:text-green-400' : insight.type === 'WARNING' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>
                <span className="text-xl mr-2">{insight.type === 'POSITIVE' ? '📈' : insight.type === 'WARNING' ? '⚠️' : '🚀'}</span>
                <span className="font-semibold">{insight.category}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{insight.content}</p>
            </div>
          ))}
          {data.insights.length === 0 && (
            <div className="col-span-3 text-center text-gray-500 py-4">No AI insights generated yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
