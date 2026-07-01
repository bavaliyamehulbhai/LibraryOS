import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReadingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/v1/reading-analytics/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load reading analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post('/v1/reading-analytics/simulate');
      if (res.data.success) {
        toast.success("Mock reading sessions injected successfully!");
        fetchData();
      }
    } catch (error) {
      toast.error("Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">📈</span> Reading Analytics Engine
          </h1>
          <p className="text-gray-500 mt-2">Track user reading behavior, calculate trends, and generate AI insights.</p>
        </div>
        <button 
          onClick={handleSimulate}
          disabled={isSimulating}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span className="text-xl">🧪</span> {isSimulating ? "Simulating..." : "Inject Mock Data"}
        </button>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="text-9xl">✨</span>
         </div>
         <div className="relative z-10">
            <h2 className="text-indigo-200 font-bold tracking-widest text-sm uppercase mb-4 flex items-center gap-2">
               Grok AI Analysis
            </h2>
            <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
               "{data?.insights || "No reading data available to analyze yet."}"
            </p>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl">
               <span className="text-4xl">⏱️</span>
            </div>
            <div>
               <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-1">Total Reading Hours</p>
               <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  {data?.overview?.totalHours?.toLocaleString() || 0} <span className="text-lg text-gray-400 font-medium">hrs</span>
               </h3>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-6">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-2xl">
               <span className="text-4xl">👥</span>
            </div>
            <div>
               <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-1">Active Readers</p>
               <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  {data?.overview?.activeReaders?.toLocaleString() || 0} <span className="text-lg text-gray-400 font-medium">users</span>
               </h3>
            </div>
         </div>
      </div>

      {/* Top Books Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Most Popular Books</h2>
         </div>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Rank</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Book Title</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Total Sessions</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Total Time</th>
               </tr>
            </thead>
            <tbody>
               {data?.topBooks?.length > 0 ? data.topBooks.map((book, index) => (
                  <tr key={book._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                     <td className="p-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full font-bold text-gray-600 dark:text-gray-300">
                           #{index + 1}
                        </span>
                     </td>
                     <td className="p-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {book.coverImage ? (
                           <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                        ) : (
                           <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">No Img</div>
                        )}
                        {book.title}
                     </td>
                     <td className="p-4 font-medium text-gray-600 dark:text-gray-400">{book.totalReads} sessions</td>
                     <td className="p-4 font-medium text-gray-600 dark:text-gray-400">{Math.floor(book.totalMinutes / 60)} hrs {book.totalMinutes % 60} mins</td>
                  </tr>
               )) : (
                  <tr>
                     <td colSpan="4" className="p-8 text-center text-gray-500">No reading data available. Click 'Inject Mock Data' to simulate.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

    </div>
  );
};

export default ReadingDashboard;
