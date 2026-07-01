import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CirculationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/v1/circulation-dashboard'),
          api.get('/v1/circulation-dashboard/charts')
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
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  const healthScore = stats ? Math.max(0, 100 - ((stats.overdueBooks || 0) * 2) - ((stats.pendingFines || 0) / 1000)) : 100;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🏛️</span> Circulation Command Center
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Real-time operational view of LibraryOS.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/circulation/feed" className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold border border-indigo-200 hover:bg-indigo-100 transition flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              Live Feed
            </Link>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Books</p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalBooks || 0}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Members</p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalMembers || 0}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Issues</p>
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats?.activeIssues || 0}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm border-l-4 border-l-red-500">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Overdue</p>
            <h2 className="text-2xl font-black text-red-600 dark:text-red-400">{stats?.overdueBooks || 0}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm border-l-4 border-l-orange-500">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Fines</p>
            <h2 className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{(stats?.pendingFines || 0).toLocaleString()}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm border-l-4 border-l-purple-500">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reservations</p>
            <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats?.pendingReservations || 0}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Circulation Trends (7 Days)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Issues" />
                  <Line type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Returns" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">❤️</div>
            <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 w-full text-left">Library Health Score</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center my-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="80" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="502" 
                  strokeDashoffset={502 - (502 * healthScore) / 100}
                  className={`${healthScore > 80 ? 'text-green-500' : healthScore > 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000`} 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-gray-900 dark:text-white">{Math.round(healthScore)}</span>
                <span className="text-sm font-bold text-gray-500">/ 100</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              {healthScore > 80 ? "Operations are running smoothly." : "Attention needed on overdues or fines."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CirculationDashboard;
