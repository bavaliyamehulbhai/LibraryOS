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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
           <Link to="/shelves" className="text-sm font-bold text-blue-600 hover:underline mb-2 inline-block">
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
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <span>🧭</span> Shelf Locator Engine
            </h2>
            <p className="text-sm text-gray-500 mb-6">Enter a new book's category and quantity, and the system will find the exact physical shelf to place it on.</p>

            <form onSubmit={handleRecommend} className="space-y-4 mb-8">
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Book Category</label>
                  <input 
                     type="text" 
                     value={category} 
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                     placeholder="e.g. Technology, Science Fiction"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Number of Copies</label>
                  <input 
                     type="number" 
                     min="1"
                     value={copies} 
                     onChange={(e) => setCopies(e.target.value)}
                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  />
               </div>
               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
               >
                  {loading ? "Calculating..." : "Find Best Shelf"}
               </button>
            </form>

            {recommendation === null ? null : recommendation ? (
               <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
                  <p className="text-sm font-bold text-green-800 dark:text-green-400 uppercase tracking-wider mb-2">Recommended Location</p>
                  <p className="text-2xl font-black text-green-900 dark:text-green-300 mb-4">{recommendation.shelfCode}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm font-bold text-green-700 dark:text-green-500">
                     <p>Floor: {recommendation.floor}</p>
                     <p>Section: {recommendation.section}</p>
                     <p>Rack: {recommendation.rack}</p>
                     <p>Category: {recommendation.category}</p>
                  </div>
                  <p className="mt-4 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-800/50 dark:text-green-300 px-3 py-1 inline-block rounded-full">
                     Available Space: {recommendation.capacity - recommendation.occupiedSlots} slots
                  </p>
               </div>
            ) : (
               <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center">
                  <p className="font-bold text-red-800 dark:text-red-400">Library Capacity Reached</p>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-2">No shelf found with enough available space to accommodate {copies} books.</p>
               </div>
            )}
         </div>

         {/* Engine 2: Grok Reorganization Assistant */}
         <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 flex flex-col">
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
               <span className="text-2xl">🤖</span> Grok Reorganization Assistant
            </h2>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-6">
               Ask Grok to analyze current shelf utilization and suggest space optimizations or moves.
            </p>

            <form onSubmit={handleAiAssistant} className="flex gap-2 mb-6">
               <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. How can we fix overloaded shelves?"
                  className="flex-1 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-900/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
               />
               <button 
                  type="submit" 
                  disabled={aiLoading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
               >
                  {aiLoading ? "Thinking..." : "Ask Grok"}
               </button>
            </form>

            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-inner border border-indigo-50 dark:border-indigo-900/30 overflow-y-auto">
               {aiResponse ? (
                  <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                     {aiResponse}
                  </div>
               ) : (
                  <div className="h-full flex items-center justify-center text-center text-indigo-300 dark:text-indigo-900/50">
                     <p className="max-w-xs">The AI has full access to your real-time shelf capacities and can generate strategic reorganization plans.</p>
                  </div>
               )}
            </div>
         </div>

      </div>

    </div>
  );
};

export default ShelfRecommendations;
