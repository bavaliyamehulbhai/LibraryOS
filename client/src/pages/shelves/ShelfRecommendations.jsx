import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ShelfRecommendations = () => {
  const [category, setCategory] = useState("");
  const [copies, setCopies] = useState(1);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleRecommend = async (e) => {
    e.preventDefault();
    if (!category) return toast.error("Please enter a category");
    
    setLoading(true);
    try {
      const res = await api.post('/v1/shelves/recommend', { category, copies });
      if (res.data.success) {
        setRecommendation(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch recommendation");
    } finally {
      setLoading(false);
    }
  };

  const handleAiAssistant = async (e) => {
    e.preventDefault();
    if (!aiQuery) return toast.error("Please ask a question");

    setAiLoading(true);
    try {
      const res = await api.post('/v1/shelves/ai-assistant', { query: aiQuery });
      if (res.data.success) {
        setAiResponse(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to connect to AI Assistant");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50">
        <div>
           <Link to="/shelves" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
               ← Back to Shelf Dashboard
           </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">✨</span> Smart Shelf Assistant
          </h1>
          <p className="text-gray-500 mt-2">Get algorithm-driven placement recommendations or ask the AI to reorganize your library.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Engine 1: Exact Placement Recommendation */}
         <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
               <span>🧭</span> Shelf Locator Engine
            </h2>
            <p className="text-sm text-gray-500 mb-6 relative z-10">Enter a new book's category and quantity, and the system will find the exact physical shelf to place it on.</p>

            <form onSubmit={handleRecommend} className="space-y-4 mb-8 relative z-10">
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Book Category</label>
                  <input 
                     type="text" 
                     required
                     value={category} 
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full bg-white/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                     placeholder="e.g. Technology, Science Fiction"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Number of Copies</label>
                  <input 
                     type="number" 
                     required
                     min="1"
                     value={copies} 
                     onChange={(e) => setCopies(e.target.value)}
                     className="w-full bg-white/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
               </div>
               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 hover:from-black hover:to-gray-900 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
               >
                  {loading ? "Calculating..." : "Find Best Shelf"}
               </button>
            </form>

            {recommendation === null ? null : recommendation ? (
               <div className="p-6 bg-green-50/80 backdrop-blur-sm dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl relative z-10">
                  <p className="text-sm font-bold text-green-800 dark:text-green-400 uppercase tracking-wider mb-2">Recommended Location</p>
                  <p className="text-2xl font-black text-green-900 dark:text-green-300 mb-4">{recommendation.shelfCode}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm font-bold text-green-700 dark:text-green-500">
                     <p>Floor: <span className="text-gray-800 dark:text-gray-300">{recommendation.floor}</span></p>
                     <p>Section: <span className="text-gray-800 dark:text-gray-300">{recommendation.section}</span></p>
                     <p>Rack: <span className="text-gray-800 dark:text-gray-300">{recommendation.rack}</span></p>
                     <p>Category: <span className="text-gray-800 dark:text-gray-300">{recommendation.category}</span></p>
                  </div>
                  <p className="mt-4 text-xs font-bold text-green-600 bg-white/50 dark:bg-green-800/50 dark:text-green-300 px-3 py-1.5 inline-block rounded-lg shadow-sm border border-green-100 dark:border-green-700/50">
                     Available Space: {recommendation.capacity - (recommendation.occupiedSlots || 0)} slots
                  </p>
               </div>
            ) : (
               <div className="p-6 bg-red-50/80 backdrop-blur-sm dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center relative z-10">
                  <p className="font-bold text-red-800 dark:text-red-400">Library Capacity Reached</p>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-2">No shelf found with enough available space to accommodate {copies} books.</p>
               </div>
            )}
         </div>

         {/* Engine 2: Grok Reorganization Assistant */}
         <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2 relative z-10">
               <span className="text-2xl">🤖</span> Grok Reorganization Assistant
            </h2>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-6 relative z-10">
               Ask Grok to analyze current shelf utilization and suggest space optimizations or moves.
            </p>

            <form onSubmit={handleAiAssistant} className="flex gap-2 mb-6 relative z-10">
               <input 
                  type="text" 
                  required
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. How can we fix overloaded shelves?"
                  className="flex-1 bg-white/50 dark:bg-gray-900 border border-indigo-200 dark:border-indigo-900/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
               />
               <button 
                  type="submit" 
                  disabled={aiLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap"
               >
                  {aiLoading ? "Thinking..." : "Ask Grok"}
               </button>
            </form>

            <div className="flex-1 bg-white/60 dark:bg-gray-900/50 p-6 rounded-2xl shadow-inner border border-white/50 dark:border-indigo-900/30 overflow-y-auto relative z-10 backdrop-blur-sm">
               {aiResponse ? (
                  <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed font-medium">
                     {aiResponse}
                  </div>
               ) : (
                  <div className="h-full flex items-center justify-center text-center text-indigo-400 dark:text-indigo-500">
                     <p className="max-w-xs font-medium">The AI has full access to your real-time shelf capacities and can generate strategic reorganization plans.</p>
                  </div>
               )}
            </div>
         </div>

      </div>

    </div>
  );
};

export default ShelfRecommendations;
