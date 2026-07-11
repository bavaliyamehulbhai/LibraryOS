import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, UserCheck, UserMinus, UserX, TrendingUp, AlertCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MemberAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/v1/members/analytics');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load member analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!data) return <div className="text-center p-12 text-gray-500">No data available</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">👥</span> Member Analytics
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">High-level overview of library membership and growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Total Members</p>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400"><Users size={20} /></div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">{data.total}</h2>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-green-100 dark:border-green-800/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-green-600 transition-colors">Active</p>
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400"><UserCheck size={20} /></div>
            </div>
            <h2 className="text-4xl font-black text-green-600 dark:text-green-400">{data.active}</h2>
            <div className="mt-2 flex items-center text-sm font-medium text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/30 inline-flex px-2 py-1 rounded-md">
              <TrendingUp size={14} className="mr-1" /> {data.total > 0 ? Math.round((data.active/data.total)*100) : 0}% of total
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-orange-100 dark:border-orange-800/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-orange-600 transition-colors">Inactive</p>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400"><UserMinus size={20} /></div>
            </div>
            <h2 className="text-4xl font-black text-orange-600 dark:text-orange-400">{data.inactive !== undefined ? data.inactive : (data.total - data.active - data.blocked) || 0}</h2>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-red-100 dark:border-red-800/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-red-600 transition-colors">Blocked</p>
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400"><UserX size={20} /></div>
            </div>
            <h2 className="text-4xl font-black text-red-600 dark:text-red-400">{data.blocked}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Membership Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Membership Types</h3>
            {data.typeBreakdown && data.typeBreakdown.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.typeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.typeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Not enough data to display breakdown.</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg flex items-center">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 mr-3">💡</span>
              Growth Insights
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 transform transition hover:scale-[1.02]">
                <div className="flex items-start">
                  <TrendingUp className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-bold text-blue-900 dark:text-blue-300 text-base">High Active Rate</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Your library maintains an excellent active member ratio.</p>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30 transform transition hover:scale-[1.02]">
                <div className="flex items-start">
                  <AlertCircle className="text-orange-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-bold text-orange-900 dark:text-orange-300 text-base">Retention Risk</p>
                    <p className="text-sm text-orange-800 dark:text-orange-400 mt-1">You have <span className="font-bold">{data.inactive !== undefined ? data.inactive : (data.total - data.active - data.blocked) || 0}</span> inactive members. Consider sending a re-engagement email or WhatsApp message.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberAnalytics;
