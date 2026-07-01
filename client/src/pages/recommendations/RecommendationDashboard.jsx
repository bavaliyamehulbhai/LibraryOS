import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RecommendationDashboard = () => {
  const [trending, setTrending] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchBaseline = async () => {
      try {
        setLoading(true);
        const [trendRes, personRes] = await Promise.all([
          api.get('/v1/recommendations/trending'),
          api.get('/v1/recommendations/me')
        ]);
        
        if (trendRes.data.success) setTrending(trendRes.data.data);
        if (personRes.data.success) setPersonalized(personRes.data.data);
      } catch (error) {
        toast.error('Failed to load basic recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchBaseline();
  }, []);

  const handleGenerateAI = async () => {
    try {
      setAiLoading(true);
      const res = await api.post('/v1/recommendations/ai');
      if (res.data.success) {
        setAiInsights(res.data.data);
        toast.success("AI Insights generated!");
      }
    } catch (error) {
      toast.error('Failed to generate AI recommendations');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">✨</span> AI Recommendation Engine
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">Personalized reading suggestions powered by Hybrid Analytics & xAI.</p>
          </div>
          <button 
            onClick={handleGenerateAI}
            disabled={aiLoading}
            className="flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition disabled:opacity-70 shadow-md"
          >
            {aiLoading ? 'Analyzing...' : 'Generate Deep AI Insights'}
          </button>
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-indigo-500/30">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <span className="text-9xl">🤖</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="text-purple-400 mr-3">✦</span> Grok AI Explanations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {aiInsights.books?.map((book, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl hover:bg-white/15 transition">
                  <h3 className="font-bold text-lg text-indigo-200">{book.title}</h3>
                  <p className="text-gray-300 mt-2 text-sm leading-relaxed">{book.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* System Personalized (Collaborative / Behavioral) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">Recommended For You</h2>
              {personalized.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Read some books to get personalized suggestions.</p>
              ) : (
                <ul className="space-y-4">
                  {personalized.map((b, i) => (
                    <li key={i} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                      <div className="h-12 w-10 bg-blue-100 dark:bg-blue-900/40 rounded flex items-center justify-center mr-4 text-xl">📖</div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{b.title}</p>
                        <p className="text-sm text-gray-500">{b.author}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Trending Books */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 flex justify-between">
                Trending Now
                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded font-bold uppercase">Hot</span>
              </h2>
              {trending.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No trending data yet.</p>
              ) : (
                <ul className="space-y-4">
                  {trending.map((b, i) => (
                    <li key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                      <div className="flex items-center">
                        <span className="text-gray-400 font-bold w-6 text-center mr-2">#{i+1}</span>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{b.title}</p>
                          <p className="text-sm text-gray-500">{b.author}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default RecommendationDashboard;
