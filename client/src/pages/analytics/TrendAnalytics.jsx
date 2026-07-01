import React from "react";
import { Link } from "react-router-dom";
import { useTrendAnalytics } from "../../hooks/useAnalytics";
import { TrendingUp, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TrendAnalytics = () => {
  const { data, isLoading } = useTrendAnalytics();
  const trends = data?.data || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historical Trends</h1>
          <p className="text-gray-500">Track library growth and activity over time.</p>
        </div>
        <Link to="/analytics/dashboard" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">Back to Dashboard</Link>
      </div>

      <div className="space-y-8">
        {/* Circulation Growth */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-orange-500" />
            <h2 className="font-bold text-gray-800 text-lg">Circulation Trends (Books Issued)</h2>
          </div>
          
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading charts...</div>
            ) : trends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">No historical data available. Run daily snapshot.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickMargin={10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="issuedBooks" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorIssued)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-purple-500" />
            <h2 className="font-bold text-gray-800 text-lg">Active Members Growth</h2>
          </div>
          
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading charts...</div>
            ) : trends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">No historical data available. Run daily snapshot.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickMargin={10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="activeUsers" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalytics;
