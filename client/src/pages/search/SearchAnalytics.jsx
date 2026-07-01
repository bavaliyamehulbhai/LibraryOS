import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SearchAnalytics = () => {
  const [analytics, setAnalytics] = useState({ topSearches: [], failedSearches: [], totalToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/v1/search/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load search analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
         <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
               <span className="text-4xl">📊</span> Search Analytics
            </h1>
            <p className="text-gray-500 mt-2">Understand what your users are looking for across the digital library.</p>
         </div>
         <div className="text-right">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total Queries Today</p>
            <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{analytics.totalToday}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* Top Searches */}
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <span>🔥</span> Top Popular Searches
            </h2>
            <div className="space-y-4">
               {analytics.topSearches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No data available.</p>
               ) : (
                  analytics.topSearches.map((item, idx) => (
                     <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                           <span className="text-gray-400 font-bold w-6 text-center">#{idx + 1}</span>
                           <span className="font-bold text-gray-900 dark:text-white text-lg">{item._id}</span>
                        </div>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-bold">
                           {item.count} queries
                        </span>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Failed Searches */}
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-6">
               <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-1">
                  <span>⚠️</span> Failed Searches (No Results)
               </h2>
               <p className="text-xs text-gray-500">Use this data to acquire new books that users are searching for but cannot find.</p>
            </div>
            
            <div className="space-y-4">
               {analytics.failedSearches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Great! No failed searches recently.</p>
               ) : (
                  analytics.failedSearches.map((item, idx) => (
                     <div key={item._id} className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-4">
                           <span className="text-red-300 dark:text-red-500/50 font-bold w-6 text-center">#{idx + 1}</span>
                           <span className="font-bold text-red-900 dark:text-red-300 text-lg">{item._id}</span>
                        </div>
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 px-3 py-1 rounded-lg text-sm font-bold">
                           {item.count} misses
                        </span>
                     </div>
                  ))
               )}
            </div>
         </div>

      </div>

    </div>
  );
};

export default SearchAnalytics;
