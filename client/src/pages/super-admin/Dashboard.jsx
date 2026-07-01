import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Building2, Users, IndianRupee, Activity, Server, TrendingUp } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/v1/super-admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load Super Admin metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading SaaS Control Center...</div>;

  const { platformStats, revenueStats, trialStats, healthStats } = stats;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Command Center</h1>
          <p className="text-gray-500 mt-1">Global view of SaaS performance, revenue, and system health.</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold flex items-center shadow-sm border ${healthStats?.status === 'Healthy' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <Server className="w-5 h-5 mr-2" />
          System: {healthStats?.status || 'Unknown'} ({healthStats?.apiLatency})
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Financial Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="MRR (Monthly)" value={`₹${revenueStats?.mrr?.toLocaleString()}`} icon={IndianRupee} color="green" />
        <StatCard title="ARR (Annualized)" value={`₹${revenueStats?.arr?.toLocaleString()}`} icon={TrendingUp} color="blue" />
        <StatCard title="Lifetime Revenue" value={`₹${revenueStats?.lifetimeRevenue?.toLocaleString()}`} icon={IndianRupee} color="purple" />
        <StatCard title="Trial Conversion" value={`${trialStats?.conversionRate}%`} icon={Activity} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6">Revenue Growth (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueStats?.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
             <h3 className="text-lg font-bold mb-4">Platform Scale</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-gray-500"><Building2 className="w-5 h-5 mr-2"/> Tenants</div>
                  <div className="font-bold text-lg">{platformStats?.totalLibraries?.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-gray-500"><Users className="w-5 h-5 mr-2"/> Total Members</div>
                  <div className="font-bold text-lg">{platformStats?.totalMembers?.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-500">Active Trials</div>
                  <div className="font-bold text-lg text-indigo-600">{trialStats?.activeTrials?.toLocaleString()}</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
