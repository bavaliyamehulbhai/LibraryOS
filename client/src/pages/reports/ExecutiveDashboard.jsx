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
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BookOpen, Users, FileText, CheckCircle, ArrowRightCircle, AlertCircle } from 'lucide-react';

const formatAIInsights = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.substring(2).split(/\*\*(.*?)\*\*/);
      return (
        <li key={i} className="ml-5 mb-2 list-disc marker:text-indigo-500 text-gray-700 dark:text-gray-300">
          {content.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-indigo-900 dark:text-indigo-300">{part}</strong> : part)}
        </li>
      );
    }
    const parts = line.split(/\*\*(.*?)\*\*/);
    return (
      <p key={i} className={`${line.trim() === '' ? 'mb-4' : 'mb-2'} text-gray-800 dark:text-gray-200`}>
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-indigo-900 dark:text-indigo-300 text-lg">{part}</strong> : part)}
      </p>
    );
  });
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 print:space-y-4 print:p-0 print:m-0 print:block print:w-full print:bg-white print:text-black">
      <style>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important; 
            color: black !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
          @page { margin: 10mm; size: A4 portrait; }
          nav, aside, header { display: none !important; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          
          /* Strict Corporate Styling Enforcements */
          * { box-shadow: none !important; }
        }
      `}</style>
      
      {/* Print-only Corporate Header */}
      <div className="hidden print:flex justify-between items-end mb-6 pb-2 border-b-2 border-gray-900">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Executive Summary</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">LibraryOS Analytics Division</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-900 uppercase">INTERNAL & CONFIDENTIAL</p>
          <p className="text-[10px] font-medium text-gray-600">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Print-only Footer */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 border-t border-gray-300 pt-2 text-center text-[10px] text-gray-500 uppercase tracking-widest">
        LibraryOS Enterprise • Auto-Generated Executive Report • CONFIDENTIAL
      </div>

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
          className="px-6 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 print:hidden"
        >
          🖨️ Export PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 print:gap-2 print:grid-cols-6 print:mb-6">
         <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800/30 hover:shadow-md hover:-translate-y-1 transition-all group print:shadow-none print:border print:border-gray-200 print:rounded-none print:border-l-4 print:border-l-blue-600 print:bg-white print:break-inside-avoid print:p-3">
            <div className="flex justify-between items-start mb-2 print:mb-1">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase print:text-gray-500 print:tracking-wider print:text-[8px]">Total Books</p>
              <BookOpen size={16} className="text-blue-500 print:hidden" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white print:text-black print:text-xl">{data.kpis.totalBooks.toLocaleString()}</p>
         </div>
         <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 hover:shadow-md hover:-translate-y-1 transition-all group print:shadow-none print:border print:border-gray-200 print:rounded-none print:border-l-4 print:border-l-emerald-600 print:bg-white print:break-inside-avoid print:p-3">
            <div className="flex justify-between items-start mb-2 print:mb-1">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase print:text-gray-500 print:tracking-wider print:text-[8px]">Total Members</p>
              <Users size={16} className="text-emerald-500 print:hidden" />
            </div>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 print:text-black print:text-xl">{data.kpis.totalMembers.toLocaleString()}</p>
         </div>
         <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 hover:shadow-md hover:-translate-y-1 transition-all group print:shadow-none print:border print:border-gray-200 print:rounded-none print:border-l-4 print:border-l-indigo-600 print:bg-white print:break-inside-avoid print:p-3">
            <div className="flex justify-between items-start mb-2 print:mb-1">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase print:text-gray-500 print:tracking-wider print:text-[8px]">Research</p>
              <FileText size={16} className="text-indigo-500 print:hidden" />
            </div>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 print:text-black print:text-xl">{data.kpis.totalResearch.toLocaleString()}</p>
         </div>
         <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-green-800/30 hover:shadow-md hover:-translate-y-1 transition-all group print:shadow-none print:border print:border-gray-200 print:rounded-none print:border-l-4 print:border-l-gray-800 print:bg-white print:break-inside-avoid print:p-3">
            <div className="flex justify-between items-start mb-2 print:mb-1">
              <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase print:text-gray-500 print:tracking-wider print:text-[8px]">Total Issues</p>
              <CheckCircle size={16} className="text-green-500 print:hidden" />
            </div>
            <p className="text-3xl font-black text-green-600 dark:text-green-400 print:text-black print:text-xl">{data.kpis.totalTransactions.toLocaleString()}</p>
         </div>
         <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-800/30 hover:shadow-md hover:-translate-y-1 transition-all group print:shadow-none print:border print:border-gray-200 print:rounded-none print:border-l-4 print:border-l-gray-800 print:bg-white print:break-inside-avoid print:p-3">
            <div className="flex justify-between items-start mb-2 print:mb-1">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase print:text-gray-500 print:tracking-wider print:text-[8px]">Current Out</p>
              <ArrowRightCircle size={16} className="text-purple-500 print:hidden" />
            </div>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400 print:text-black print:text-xl">{data.kpis.activeIssues.toLocaleString()}</p>
         </div>
         <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50 hover:shadow-md hover:-translate-y-1 transition-all group relative overflow-hidden print:shadow-none print:border print:border-gray-200 print:rounded-none print:border-l-4 print:border-l-red-600 print:bg-white print:break-inside-avoid print:p-3">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full -mr-8 -mt-8 blur-xl print:hidden"></div>
            <div className="flex justify-between items-start mb-2 relative z-10 print:mb-1">
              <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase print:text-red-600 print:tracking-wider print:text-[8px]">Overdue</p>
              <AlertCircle size={16} className="text-red-500 print:hidden" />
            </div>
            <p className="text-3xl font-black text-red-600 dark:text-red-400 relative z-10 print:text-black print:text-xl">{data.kpis.overdueIssues.toLocaleString()}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-6">
         
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 print:shadow-none print:border print:border-gray-300 print:rounded-none print:break-inside-avoid print:p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 print:uppercase print:tracking-widest print:border-b print:border-gray-200 print:pb-2 print:mb-4 print:text-black print:text-[10px]">Volume Analysis</h2>
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
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                           {data.categoryStats.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            )}
         </div>

         {/* AI Insights Section */}
         <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 flex flex-col print:border print:border-gray-300 print:bg-none print:shadow-none print:rounded-none print:break-inside-avoid print:border-t-4 print:border-t-gray-900 print:bg-gray-50 print:p-4 print:mt-6">
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2 print:text-black print:uppercase print:tracking-widest print:text-[10px] print:mb-2 print:border-b print:border-gray-200 print:pb-2">
               <span className="text-2xl print:hidden">✨</span> <span className="hidden print:inline mr-2">♦</span> AI Predictive Analysis
            </h2>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-6 print:hidden">
               Grok analyzes your real-time library data to generate actionable insights and recommendations.
            </p>

            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-inner border border-indigo-50 dark:border-indigo-900/30 overflow-y-auto print:border-none print:shadow-none print:text-black print:bg-transparent print:p-0 print:overflow-visible print:text-xs">
               {aiLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-400 print:hidden">
                     <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                     <p className="text-sm font-bold animate-pulse">Grok is analyzing your data...</p>
                  </div>
               ) : aiInsights ? (
                  <div className="text-sm leading-relaxed font-medium">
                     {formatAIInsights(aiInsights)}
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
