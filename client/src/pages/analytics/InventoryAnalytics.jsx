import React from "react";
import { Link } from "react-router-dom";
import { useInventoryAnalytics } from "../../hooks/useAnalytics";
import { Archive, AlertCircle, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const InventoryAnalytics = () => {
  const { data: invData, isLoading } = useInventoryAnalytics();

  const lowStock = invData?.data?.lowStock || [];
  const conditionStats = invData?.data?.copyStats || [];

  // Transform conditionStats for chart
  const chartData = conditionStats.map(item => ({
    name: item._id,
    count: item.count
  }));

  const conditionColors = {
    'NEW': '#10b981', // green
    'GOOD': '#3b82f6', // blue
    'FAIR': '#f59e0b', // yellow
    'DAMAGED': '#ef4444', // red
    'LOST': '#9ca3af' // gray
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Health & Capacity</h1>
          <p className="text-gray-500">Monitor physical asset conditions and low stock alerts.</p>
        </div>
        <Link to="/analytics/dashboard" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Low Stock Alerts */}
        <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-red-100 bg-red-50 flex items-center gap-2">
            <AlertCircle className="text-red-500" />
            <h2 className="font-bold text-red-800">Low Stock Alerts (Available &lt; 3)</h2>
          </div>
          <div className="p-0 flex-1">
            {isLoading ? (
              <div className="p-10 text-center text-gray-400">Loading...</div>
            ) : lowStock.length === 0 ? (
              <div className="p-10 text-center text-green-500 font-medium">No low stock items!</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-xs border-b">
                  <tr>
                    <th className="px-5 py-3">Book Title</th>
                    <th className="px-5 py-3 text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStock.map((item, idx) => (
                    <tr key={idx} className="hover:bg-red-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-800">{item.book}</td>
                      <td className="px-5 py-3 text-right font-bold text-red-600">{item.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Copy Condition Chart */}
        <div className="bg-white border rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="text-blue-500" />
            <h2 className="font-bold text-gray-800 text-lg">Physical Copy Conditions</h2>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading charts...</div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">No copies scanned.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickMargin={10} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={conditionColors[entry.name] || '#9ca3af'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
