import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ShelfDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, shelvesRes] = await Promise.all([
        api.get('/v1/shelves/analytics'),
        api.get('/v1/shelves')
      ]);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (shelvesRes.data.success) setShelves(shelvesRes.data.data);
    } catch (error) {
      toast.error("Failed to load shelf data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">📚</span> Physical Library Intelligence
          </h1>
          <p className="text-gray-500 mt-2">Manage shelf capacity, racks, and book distribution.</p>
        </div>
        <Link 
          to="/shelves/recommendations" 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <span>✨</span> Smart Recommendations
        </Link>
      </div>

      {/* Analytics Cards */}
      {analytics && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 hover:-translate-y-1 transition-all border-b-4 border-b-slate-400">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Total Shelves</p>
               <p className="text-4xl font-black text-gray-900 dark:text-white">{analytics.totalShelves}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 hover:-translate-y-1 transition-all border-b-4 border-b-blue-500">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Space Utilization</p>
               <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{analytics.utilizationPercent}%</p>
                  <p className="text-sm text-gray-500 mb-1 font-medium">({analytics.totalOccupied} / {analytics.totalCapacity})</p>
               </div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 hover:-translate-y-1 transition-all border-b-4 border-b-green-500">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Healthy Shelves</p>
               <p className="text-4xl font-black text-green-600 dark:text-green-400">{analytics.healthyCount}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 hover:-translate-y-1 transition-all border-b-4 border-b-red-500">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Overloaded Shelves</p>
               <p className="text-4xl font-black text-red-600 dark:text-red-400">{analytics.overloadedCount}</p>
            </div>
         </div>
      )}

      {/* Shelf Heatmap / Table */}
      <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden relative z-10">
         <div className="p-6 bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shelf Utilization Heatmap</h2>
         </div>
         <div className="p-6">
            {shelves.length === 0 ? (
               <div className="text-center py-12 text-gray-500">
                  No shelves configured yet. Ask your Library Admin to set them up.
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shelves.map(shelf => {
                     const util = Math.round((shelf.occupiedSlots / shelf.capacity) * 100);
                     if (util >= 90) {
                        bgColor = "bg-red-50/80 dark:bg-red-900/30";
                        textColor = "text-red-700 dark:text-red-400";
                        barColor = "bg-gradient-to-r from-red-500 to-rose-600";
                     } else if (util >= 75) {
                        bgColor = "bg-yellow-50/80 dark:bg-yellow-900/30";
                        textColor = "text-yellow-700 dark:text-yellow-400";
                        barColor = "bg-gradient-to-r from-yellow-400 to-orange-500";
                     } else {
                        bgColor = "bg-green-50/80 dark:bg-green-900/30";
                        textColor = "text-green-700 dark:text-green-400";
                        barColor = "bg-gradient-to-r from-emerald-400 to-green-500";
                     }

                     return (
                        <div key={shelf._id} className={`p-6 rounded-2xl border ${bgColor} border-white/50 shadow-sm backdrop-blur-sm relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md group`}>
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <h3 className={`font-black text-xl ${textColor}`}>{shelf.shelfCode}</h3>
                                 <p className="text-sm font-bold opacity-80 mt-1">{shelf.category}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-bold uppercase opacity-60">{shelf.floor}</p>
                                 <p className="text-xs font-bold uppercase opacity-60">Section {shelf.section}</p>
                                 <p className="text-xs font-bold uppercase opacity-60">Rack {shelf.rack}</p>
                              </div>
                           </div>
                           
                           <div>
                              <div className="flex justify-between text-xs font-bold mb-1 opacity-80">
                                 <span>{shelf.occupiedSlots} Books</span>
                                 <span>{shelf.capacity} Max</span>
                              </div>
                              <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                                 <div className={`h-full ${barColor}`} style={{ width: `${Math.min(util, 100)}%` }}></div>
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default ShelfDashboard;
