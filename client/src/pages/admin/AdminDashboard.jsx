import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/admin/StatCard';
import RecentActivities from '../../components/admin/RecentActivities';
import TopLibraries from '../../components/admin/TopLibraries';
import GrowthChart from '../../components/admin/GrowthChart';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd use a service layer or axios to fetch the data
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/v1/admin/dashboard");
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">SaaS Command Center overview</p>
        </div>
      </div>

      {data && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Libraries" 
              value={data.totalLibraries} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>} 
              color="border-blue-500" 
            />
            <StatCard 
              title="Total Users" 
              value={data.totalUsers} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} 
              color="border-green-500" 
            />
            <StatCard 
              title="Active Subscriptions" 
              value={data.activeSubscriptions} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} 
              color="border-purple-500" 
            />
            <StatCard 
              title="Total Revenue (₹)" 
              value={`₹${data.revenue.toLocaleString()}`} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} 
              color="border-yellow-500" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <GrowthChart />
              <TopLibraries libraries={data.recentLibraries} />
            </div>
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">System Health</h3>
                <ul className="space-y-3">
                  {Object.entries(data.systemHealth).map(([key, value]) => (
                    <li key={key} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{key}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${value === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <RecentActivities activities={data.recentActivities} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
