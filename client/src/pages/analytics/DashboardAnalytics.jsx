import React from "react";
import { Link } from "react-router-dom";
import { useDashboardAnalytics, useTrendAnalytics } from "../../hooks/useAnalytics";
import { Book, Users, BookOpen, CheckCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardAnalytics = () => {
  const { data: dashData, isLoading: loadingDash } = useDashboardAnalytics();
  const { data: trendData } = useTrendAnalytics();

  const stats = dashData?.data;
  const trends = trendData?.data || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Library Analytics</h1>
          <p className="text-gray-500">Business intelligence and insights for your library ecosystem.</p>
        </div>
        <div className="space-x-4">
          <Link to="/analytics/books" className="text-blue-600 hover:underline text-sm font-medium">Book Analytics</Link>
          <Link to="/analytics/inventory" className="text-blue-600 hover:underline text-sm font-medium">Inventory Analytics</Link>
        </div>
      </div>

      {loadingDash ? (
        <div className="text-center py-20 text-gray-400">Loading analytics...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Books</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalBooks || 0}</p>
                <p className="text-xs text-gray-400 mt-2">Across {stats?.totalCopies || 0} copies</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-full"><Book className="text-blue-500" size={28}/></div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Books Issued</p>
                <p className="text-3xl font-bold text-orange-600">{stats?.issuedBooks || 0}</p>
                <p className="text-xs text-orange-400 mt-2">Currently in circulation</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-full"><BookOpen className="text-orange-500" size={28}/></div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Available</p>
                <p className="text-3xl font-bold text-green-600">{stats?.availableBooks || 0}</p>
                <p className="text-xs text-green-400 mt-2">Ready to be issued</p>
              </div>
              <div className="bg-green-50 p-4 rounded-full"><CheckCircle className="text-green-500" size={28}/></div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Active Members</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.activeMembers || 0}</p>
                <p className="text-xs text-purple-400 mt-2">Registered users</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-full"><Users className="text-purple-500" size={28}/></div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white border rounded-xl p-6 shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">Historical Growth (Total Books)</h2>
            </div>
            
            {trends.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="totalBooks" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                Not enough historical data to display trends. Run the daily snapshot job.
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/analytics/books" className="bg-blue-600 text-white p-6 rounded-xl shadow hover:bg-blue-700 transition flex justify-between items-center group">
              <div>
                <h3 className="text-xl font-bold mb-1">Deep Dive: Book Insights</h3>
                <p className="text-blue-100 text-sm">View category performance, popular books, and dead inventory.</p>
              </div>
              <TrendingUp className="opacity-50 group-hover:scale-110 transition" size={32} />
            </Link>
            
            <Link to="/analytics/inventory" className="bg-slate-800 text-white p-6 rounded-xl shadow hover:bg-slate-700 transition flex justify-between items-center group">
              <div>
                <h3 className="text-xl font-bold mb-1">Deep Dive: Inventory Health</h3>
                <p className="text-slate-300 text-sm">Monitor low stock alerts, damaged copies, and overall capacity.</p>
              </div>
              <BookOpen className="opacity-50 group-hover:scale-110 transition" size={32} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnalytics;
