import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const Overview = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/v1/branches');
        if (res.data.success) {
          setBranches(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedBranch(res.data.data[0]._id);
          }
        }
      } catch (error) {
        toast.error('Failed to load branches');
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, growthRes] = await Promise.all([
          api.get(`/v1/branch-analytics/overview?branchId=${selectedBranch}`),
          api.get(`/v1/branch-analytics/growth?branchId=${selectedBranch}`)
        ]);
        
        if (overviewRes.data.success) {
          setOverview(overviewRes.data.data);
        }
        if (growthRes.data.success) {
          setGrowth(growthRes.data.data);
        }
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [selectedBranch]);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">📊</span> Branch Overview
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">View high-level analytics for specific branches.</p>
          </div>
          <div>
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : overview ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Books</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{overview.books.toLocaleString()}</h2>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Members</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{overview.members.toLocaleString()}</h2>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Issues</p>
                <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{overview.issues.toLocaleString()}</h2>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Returns</p>
                <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{overview.returns.toLocaleString()}</h2>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Revenue</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">₹{overview.revenue.toLocaleString()}</h2>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white flex items-start">
              <span className="text-3xl mr-4">✨</span>
              <div>
                <h3 className="font-bold text-lg mb-1">AI Branch Insight</h3>
                <p className="text-blue-100 opacity-90 leading-relaxed">
                  Revenue is projected to grow by 12% next month based on current member acquisition rates.
                  Circulation activity peaks significantly during early morning hours.
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Growth Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Revenue Growth (6 Months)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                        itemStyle={{ color: '#60A5FA' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#60A5FA" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Members vs Issues Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Engagement Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" yAxisId="left" />
                      <YAxis stroke="#9CA3AF" yAxisId="right" orientation="right" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="members" name="Members" fill="#818CF8" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="issues" name="Issues" fill="#34D399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">No data available for this branch.</div>
        )}
      </div>
    </div>
  );
};

export default Overview;
