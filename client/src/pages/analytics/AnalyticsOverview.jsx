import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Users, IndianRupee, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Library Intelligence...</div>;

  const { overview, growth, engagement } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Intelligence</h1>
        <p className="text-gray-500 mt-1">Real-time insights and operational metrics for your library.</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Core Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Books" value={overview?.totalBooks?.toLocaleString()} icon={BookOpen} color="blue" />
        <StatCard title="Total Members" value={overview?.totalMembers?.toLocaleString()} icon={Users} color="green" />
        <StatCard title="Active Issues" value={overview?.activeIssues?.toLocaleString()} icon={Activity} color="yellow" />
        <StatCard title="Overdue Returns" value={overview?.overdueIssues?.toLocaleString()} icon={AlertTriangle} color="red" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="Collected Fines" value={`₹${overview?.collectedRevenue?.toLocaleString()}`} icon={IndianRupee} color="purple" />
        <StatCard title="Pending Fines" value={`₹${overview?.pendingRevenue?.toLocaleString()}`} icon={TrendingUp} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6">Member Growth Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth?.memberGrowthChart}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip />
                <Area type="monotone" dataKey="members" stroke="#10b981" fillOpacity={1} fill="url(#colorMembers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
             <h3 className="text-lg font-bold mb-4">Top Borrowed Books</h3>
             {engagement?.topBooks && engagement.topBooks.length > 0 ? (
               <div className="space-y-4">
                  {engagement.topBooks.map((book, index) => (
                    <div key={index} className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{book.title}</div>
                        <div className="text-sm text-gray-500">{book.author}</div>
                      </div>
                      <div className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
                        {book.issueCount} <span className="font-normal text-indigo-400">issues</span>
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="text-center text-gray-500 mt-10">No borrowing data yet.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
