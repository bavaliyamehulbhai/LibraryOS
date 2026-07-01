import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const AIAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/v1/ai-analytics/overview');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load AI Analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  if (!data) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl shadow-lg border border-indigo-700 text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🧠</div>
        <div className="relative z-10 w-full">
           <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <span className="text-4xl">✨</span> AI Intelligence Platform
           </h1>
           <p className="text-indigo-200">Predictive insights and automated decision support.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left Column: Health & Executive Summary */}
         <div className="space-y-8 lg:col-span-1">
            
            {/* Health Score */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
               <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-4 uppercase tracking-wider text-sm">Library Health Score</h3>
               <div className="flex justify-center items-center mb-2">
                  <div className="relative w-40 h-40">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" className="stroke-current text-gray-100 dark:text-gray-700" strokeWidth="12" fill="none" />
                        <circle cx="80" cy="80" r="70" className="stroke-current text-indigo-500" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * data.health.score) / 100} strokeLinecap="round" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">{data.health.score}</span>
                        <span className="text-sm font-bold text-indigo-500">{data.health.status}</span>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                     <p className="text-xs text-gray-500 font-bold">Active Members</p>
                     <p className="text-lg font-black text-gray-900 dark:text-white">{data.health.metrics.activeMembers}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                     <p className="text-xs text-gray-500 font-bold">Monthly Issues</p>
                     <p className="text-lg font-black text-gray-900 dark:text-white">{data.health.metrics.monthlyCirculation}</p>
                  </div>
               </div>
            </div>

            {/* AI Executive Summary */}
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-8 rounded-3xl shadow-sm border border-gray-800 text-white">
               <h3 className="font-black mb-4 flex items-center gap-2">
                  <span>🤖</span> AI Executive Summary
               </h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  "{data.summary.summary}"
               </p>
               
               <div className="space-y-4">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🚀 Growth Areas</p>
                     <div className="flex flex-wrap gap-2">
                        {data.summary.growthAreas.map(area => (
                           <span key={area} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">{area}</span>
                        ))}
                     </div>
                  </div>
                  
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">⚠️ Areas for Improvement</p>
                     <div className="flex flex-wrap gap-2">
                        {data.summary.weakAreas.map(area => (
                           <span key={area} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">{area}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

         </div>

         {/* Right Column: Forecasts & Recommendations */}
         <div className="space-y-8 lg:col-span-2">
            
            {/* Demand Forecast Chart */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span>📈</span> Category Demand Forecast
               </h3>
               <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Bar dataKey="currentDemand" name="Current Demand" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="forecastedDemand" name="Forecasted (Next 30 Days)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Smart Acquisition Engine */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>🛒</span> Smart Acquisition Engine
               </h3>
               <p className="text-sm text-gray-500 mb-6">AI-recommended book purchases based on reservation queues and search trends.</p>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                           <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Book Title</th>
                           <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Why? (AI Insight)</th>
                           <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Recommendation</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.recommendations.map((rec, i) => (
                           <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                              <td className="py-4">
                                 <p className="font-bold text-gray-900 dark:text-white">{rec.title}</p>
                                 <p className="text-xs text-gray-500">{rec.author}</p>
                              </td>
                              <td className="py-4">
                                 <span className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                                    {rec.reason}
                                 </span>
                              </td>
                              <td className="py-4">
                                 <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">
                                    {rec.action}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default AIAnalyticsDashboard;
