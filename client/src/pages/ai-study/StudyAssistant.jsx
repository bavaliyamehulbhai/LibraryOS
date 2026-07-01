import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudyAssistant = () => {
  const [activeTab, setActiveTab] = useState("SUMMARIZE");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, [result]); // Re-fetch progress when a new result is generated

  const fetchProgress = async () => {
    try {
      const res = await api.get('/v1/ai-study/progress');
      if (res.data.success) {
        setProgress(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load study progress", error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic && !content) return toast.error("Please provide a topic or paste content.");
    
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/v1/ai-study/generate', { mode: activeTab, topic, content });
      if (res.data.success) {
        setResult(res.data.data);
        toast.success("Generated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to connect to AI Study Assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">🤖</span> AI Study Copilot
          </h1>
          <p className="text-gray-500 mt-2">Generate summaries, explanations, notes, and quizzes instantly.</p>
        </div>
        
        {/* Progress Mini Dashboard */}
        {progress && (
           <div className="flex gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{progress.quizzesCompleted}</p>
                 <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Quizzes</p>
              </div>
              <div className="w-px bg-indigo-200 dark:bg-indigo-800"></div>
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{progress.notesGenerated}</p>
                 <p className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">Notes</p>
              </div>
              <div className="w-px bg-indigo-200 dark:bg-indigo-800"></div>
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{progress.summariesGenerated}</p>
                 <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Summaries</p>
              </div>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Tools Sidebar */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit space-y-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Learning Tools</h2>
            
            <button 
               onClick={() => setActiveTab("SUMMARIZE")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'SUMMARIZE' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
            >
               <span>📝</span> 1-Min Summarizer
            </button>
            <button 
               onClick={() => setActiveTab("EXPLAIN")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'EXPLAIN' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
            >
               <span>💡</span> Explain Concept
            </button>
            <button 
               onClick={() => setActiveTab("NOTES")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'NOTES' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
            >
               <span>📋</span> Generate Notes
            </button>
            <button 
               onClick={() => setActiveTab("QUIZ")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'QUIZ' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
            >
               <span>🎯</span> Generate MCQ Quiz
            </button>
         </div>

         {/* Main Workspace */}
         <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleGenerate} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {activeTab === 'SUMMARIZE' && 'Paste text to summarize'}
                  {activeTab === 'EXPLAIN' && 'What concept do you want explained?'}
                  {activeTab === 'NOTES' && 'What topic do you need notes for?'}
                  {activeTab === 'QUIZ' && 'What topic should the quiz cover?'}
               </h2>

               <div className="space-y-4">
                  <input 
                     type="text" 
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     placeholder={activeTab === 'SUMMARIZE' ? 'Optional: Title of the text' : 'Enter topic or concept (e.g., Node.js Event Loop)'}
                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  />
                  
                  <textarea 
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="Optional: Paste the actual book text, paragraph, or context here to get a highly accurate response."
                     className="w-full h-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors resize-none"
                  ></textarea>
               </div>

               <button 
                  type="submit" 
                  disabled={loading}
                  className="mt-6 w-full py-4 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white font-bold text-lg rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
               >
                  {loading ? (
                     <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Grok is generating...</span>
                     </>
                  ) : (
                     <>
                        <span>✨</span> Generate Output
                     </>
                  )}
               </button>
            </form>

            {/* Result Area */}
            {result && (
               <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-indigo-200 dark:border-indigo-800">
                     <h3 className="font-black text-xl text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                        <span>🤖</span> AI Output
                     </h3>
                     <button 
                        onClick={() => {navigator.clipboard.writeText(result); toast.success("Copied to clipboard!");}}
                        className="text-sm font-bold bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                     >
                        Copy Text
                     </button>
                  </div>
                  
                  <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                     {result}
                  </div>
               </div>
            )}
         </div>

      </div>

    </div>
  );
};

export default StudyAssistant;
