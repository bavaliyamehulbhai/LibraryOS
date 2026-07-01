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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">📚</span> Physical Library Intelligence
          </h1>
          <p className="text-gray-500 mt-2">Manage shelf capacity, racks, and book distribution.</p>
        </div>
        <Link 
          to="/shelves/recommendations" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>✨</span> Smart Recommendations
        </Link>
      </div>

      {/* Analytics Cards */}
      {analytics && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <p className="text-sm text-gray-500 font-bold uppercase mb-2">Total Shelves</p>
               <p className="text-4xl font-black text-gray-900 dark:text-white">{analytics.totalShelves}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <p className="text-sm text-gray-500 font-bold uppercase mb-2">Space Utilization</p>
               <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{analytics.utilizationPercent}%</p>
                  <p className="text-sm text-gray-500 mb-1">({analytics.totalOccupied} / {analytics.totalCapacity})</p>
               </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <p className="text-sm text-gray-500 font-bold uppercase mb-2">Healthy Shelves</p>
               <p className="text-4xl font-black text-green-600 dark:text-green-400">{analytics.healthyCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <p className="text-sm text-gray-500 font-bold uppercase mb-2">Overloaded Shelves</p>
               <p className="text-4xl font-black text-red-600 dark:text-red-400">{analytics.overloadedCount}</p>
            </div>
         </div>
      )}

      {/* Shelf Heatmap / Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
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
                     let bgColor = "bg-green-100 dark:bg-green-900/30";
                     let textColor = "text-green-700 dark:text-green-400";
                     let barColor = "bg-green-500";
                     
                     if (util >= 90) {
                        bgColor = "bg-red-100 dark:bg-red-900/30";
                        textColor = "text-red-700 dark:text-red-400";
                        barColor = "bg-red-500";
                     } else if (util >= 75) {
                        bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
                        textColor = "text-yellow-700 dark:text-yellow-400";
                        barColor = "bg-yellow-500";
                     }

                     return (
                        <div key={shelf._id} className={`p-5 rounded-2xl border ${bgColor} border-transparent relative overflow-hidden transition-all hover:scale-[1.02]`}>
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
