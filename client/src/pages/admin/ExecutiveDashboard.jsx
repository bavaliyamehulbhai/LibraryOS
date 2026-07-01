import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/admin/StatCard';
import GrowthChart from '../../components/admin/GrowthChart';

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API fetch for Executive data
    const fetchAnalytics = async () => {
      try {
        // Fetch health, churn, and insights sequentially
        const [healthRes, churnRes, insightRes] = await Promise.all([
          api.get("/v1/analytics/health"),
          api.get("/v1/analytics/churn"),
          api.get("/v1/analytics/insights")
        ]);

        setData({
          health: healthRes.data.data,
          churn: churnRes.data.data,
          insights: insightRes.data.data || []
        });
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Executive Insights...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
        <p className="text-gray-500 mt-1">Tenant intelligence, health monitoring, and churn risks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Platform Revenue" value="₹2,50,000" color="border-green-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
        <StatCard title="Active Libraries" value="120" color="border-blue-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>} />
        <StatCard title="Health Score Avg" value={data?.health?.score || "89"} color="border-purple-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>} />
        <StatCard title="Churn Risk" value={`${data?.churn?.score || "8"} Libraries`} color="border-red-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <GrowthChart />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Automated Insights</h2>
          {data?.insights?.length > 0 ? (
            <ul className="space-y-4">
              {data.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <div className={`p-2 rounded-full mr-3 ${insight.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{insight.title}</h4>
                    <p className="text-xs text-gray-500">{insight.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No critical insights at this moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
