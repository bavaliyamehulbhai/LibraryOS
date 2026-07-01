import React from "react";
import { Link } from "react-router-dom";
import { useBookAnalytics, useCategoryAnalytics } from "../../hooks/useAnalytics";
import { Book, Award, AlertTriangle, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const BookAnalytics = () => {
  const { data: bookData, isLoading: loadingBooks } = useBookAnalytics();
  const { data: catData, isLoading: loadingCats } = useCategoryAnalytics();

  const mostPopular = bookData?.data?.mostPopular || [];
  const deadInventory = bookData?.data?.deadInventory || [];
  const categories = catData?.data || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book & Category Insights</h1>
          <p className="text-gray-500">Analyze popular titles, dead inventory, and category distribution.</p>
        </div>
        <Link to="/analytics/dashboard" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Most Popular Books */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b bg-gray-50 flex items-center gap-2">
            <Award className="text-yellow-500" />
            <h2 className="font-bold text-gray-800">Most Popular Books</h2>
          </div>
          <div className="p-0 flex-1">
            {loadingBooks ? (
              <div className="p-10 text-center text-gray-400">Loading...</div>
            ) : mostPopular.length === 0 ? (
              <div className="p-10 text-center text-gray-400">No circulation data yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-5 py-3 border-b">Book Title</th>
                    <th className="px-5 py-3 border-b text-right">Total Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mostPopular.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800 flex items-center gap-2">
                        <span className="text-gray-400 w-4 text-xs">{idx + 1}.</span> {item.title}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-blue-600">{item.issues}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dead Inventory */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b bg-gray-50 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            <h2 className="font-bold text-gray-800">Dead Inventory (Never Issued)</h2>
          </div>
          <div className="p-0 flex-1">
            {loadingBooks ? (
              <div className="p-10 text-center text-gray-400">Loading...</div>
            ) : deadInventory.length === 0 ? (
              <div className="p-10 text-center text-green-500 font-medium">Great! All books have been issued at least once.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-5 py-3 border-b">Book Title</th>
                    <th className="px-5 py-3 border-b text-right">Available Copies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deadInventory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{item.title}</td>
                      <td className="px-5 py-3 text-right font-bold text-red-500">{item.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Category Analytics */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon className="text-purple-500" />
          <h2 className="font-bold text-gray-800 text-lg">Category Distribution</h2>
        </div>
        
        {loadingCats ? (
          <div className="h-80 flex items-center justify-center text-gray-400">Loading charts...</div>
        ) : categories.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-400 bg-gray-50 rounded">No categories found.</div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} Books`, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAnalytics;
