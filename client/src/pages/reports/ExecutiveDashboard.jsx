import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/v1/reports/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
      
      // Fetch AI Insights in parallel but don't block main render
      fetchAiInsights();
    } catch (error) {
      toast.error("Failed to load executive dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    try {
      const res = await api.get('/v1/reports/ai-insights');
      if (res.data.success) {
        setAiInsights(res.data.data);
      }
    } catch (error) {
      console.error("AI Insights failed", error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  if (!data) return <div className="p-12 text-center text-gray-500">No data available.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">📈</span> Executive Reports
          </h1>
          <p className="text-gray-500 mt-2">Centralized business intelligence and AI-driven recommendations.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="px-6 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          🖨️ Export PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Books</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{data.kpis.totalBooks.toLocaleString()}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Members</p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{data.kpis.totalMembers.toLocaleString()}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Research Papers</p>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{data.kpis.totalResearch.toLocaleString()}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Issues</p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">{data.kpis.totalTransactions.toLocaleString()}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Currently Out</p>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{data.kpis.activeIssues.toLocaleString()}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30">
            <p className="text-xs text-red-500 font-bold uppercase mb-1">Overdue</p>
            <p className="text-3xl font-black text-red-600 dark:text-red-400">{data.kpis.overdueIssues.toLocaleString()}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Top Categories by Volume</h2>
            {data.categoryStats.length === 0 ? (
               <p className="text-gray-500 text-center py-12">No category data available.</p>
            ) : (
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data.categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                        <Tooltip 
                           cursor={{fill: '#f3f4f6'}}
                           contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            )}
         </div>

         {/* AI Insights Section */}
         <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 flex flex-col">
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
               <span className="text-2xl">✨</span> AI Executive Summary
            </h2>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-6">
               Grok analyzes your real-time library data to generate actionable insights and recommendations.
            </p>

            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-inner border border-indigo-50 dark:border-indigo-900/30 overflow-y-auto">
               {aiLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-400">
                     <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                     <p className="text-sm font-bold animate-pulse">Grok is analyzing your data...</p>
                  </div>
               ) : aiInsights ? (
                  <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed font-medium">
                     {aiInsights}
                  </div>
               ) : (
                  <div className="text-center text-gray-500">Failed to generate insights.</div>
               )}
            </div>
         </div>

      </div>

    </div>
  );
};

export default ExecutiveDashboard;
