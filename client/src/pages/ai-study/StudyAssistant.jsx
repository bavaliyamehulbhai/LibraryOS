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
  
  // Quiz specific states
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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
    setQuizData(null);
    try {
      const res = await api.post('/v1/ai-study/generate', { mode: activeTab, topic, content });
      if (res.data.success) {
        if (activeTab === "QUIZ") {
           try {
             let rawOutput = res.data.data;
             const jsonMatch = rawOutput.match(/\[[\s\S]*\]/);
             if (jsonMatch) {
               rawOutput = jsonMatch[0];
             }
             const parsedData = JSON.parse(rawOutput);
             setQuizData(parsedData);
             setSelectedAnswers({});
             setQuizSubmitted(false);
             setResult(null);
           } catch(e) {
             console.error("Failed to parse quiz JSON", e);
             setResult(res.data.data); 
             setQuizData(null);
           }
        } else {
           setResult(res.data.data);
           setQuizData(null);
        }
        toast.success("Generated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to connect to AI Study Assistant");
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text) => {
    if (!text) return { __html: '' };
    let html = text
      // Headings
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2 text-indigo-900 dark:text-indigo-300">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-indigo-900 dark:text-indigo-300 border-b border-indigo-100 dark:border-indigo-900/50 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-8 mb-4 text-indigo-900 dark:text-indigo-300">$1</h1>')
      
      // Remove Llama's ugly ===== and ----- dividers
      .replace(/^={3,}|^-{3,}/gim, '')

      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
      
      // Code blocks and inline code
      .replace(/`(.*?)`/g, '<code class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

      // Lists
      .replace(/^[*-] (.*$)/gim, '<li class="ml-6 list-disc mb-1 marker:text-indigo-500">$1</li>')
      .replace(/^\+ (.*$)/gim, '<li class="ml-10 list-[circle] mb-1 marker:text-indigo-400 text-sm">$1</li>');

    return { __html: html };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl animate-bounce">🤖</span> AI Study Copilot
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Generate summaries, explanations, notes, and quizzes instantly.</p>
        </div>
        
        {/* Progress Mini Dashboard */}
        {progress && (
           <div className="flex gap-4 bg-white/50 backdrop-blur-sm dark:bg-indigo-900/30 p-4 rounded-2xl border border-white dark:border-indigo-800/50 shadow-inner">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
         
         {/* Tools Sidebar */}
         <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 h-fit space-y-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Learning Tools</h2>
            
            <button 
               onClick={() => setActiveTab("SUMMARIZE")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'SUMMARIZE' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/50 scale-[1.02]' : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-transparent'}`}
            >
               <span>📝</span> 1-Min Summarizer
            </button>
            <button 
               onClick={() => setActiveTab("EXPLAIN")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'EXPLAIN' ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 dark:from-purple-900/40 dark:to-pink-900/40 dark:text-purple-400 shadow-sm border border-purple-100 dark:border-purple-800/50 scale-[1.02]' : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-transparent'}`}
            >
               <span>💡</span> Explain Concept
            </button>
            <button 
               onClick={() => setActiveTab("NOTES")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'NOTES' ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/50 scale-[1.02]' : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-transparent'}`}
            >
               <span>📋</span> Generate Notes
            </button>
            <button 
               onClick={() => setActiveTab("QUIZ")}
               className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'QUIZ' ? 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 dark:from-rose-900/40 dark:to-red-900/40 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-800/50 scale-[1.02]' : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-transparent'}`}
            >
               <span>🎯</span> Generate MCQ Quiz
            </button>
         </div>

         {/* Main Workspace */}
         <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleGenerate} className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {activeTab === 'SUMMARIZE' && 'Paste text to summarize'}
                  {activeTab === 'EXPLAIN' && 'What concept do you want explained?'}
                  {activeTab === 'NOTES' && 'What topic do you need notes for?'}
                  {activeTab === 'QUIZ' && 'What topic should the quiz cover?'}
               </h2>

               <div className="space-y-5">
                  <input 
                     type="text" 
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     placeholder={activeTab === 'SUMMARIZE' ? 'Optional: Title of the text' : 'Enter topic or concept (e.g., Node.js Event Loop)'}
                     className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  />
                  
                  <textarea 
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="Optional: Paste the actual book text, paragraph, or context here to get a highly accurate response."
                     className="w-full h-40 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner resize-none leading-relaxed"
                  ></textarea>
               </div>

               <button 
                  type="submit" 
                  disabled={loading}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 hover:from-black hover:to-gray-900 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
               <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 animate-fade-in-up relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 relative z-10">
                     <h3 className="font-black text-xl text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                        <span>🤖</span> AI Output
                     </h3>
                     <button 
                        onClick={() => {navigator.clipboard.writeText(result); toast.success("Copied to clipboard!");}}
                        className="text-sm font-bold bg-white/50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400 px-5 py-2 rounded-xl shadow-sm hover:shadow transition-all border border-indigo-100 dark:border-indigo-800/30 backdrop-blur-sm"
                     >
                        Copy Text
                     </button>
                  </div>
                  
                  <div 
                     className="prose prose-indigo dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed relative z-10"
                     dangerouslySetInnerHTML={formatMarkdown(result)}
                  />
               </div>
            )}
            
            {/* Interactive Quiz Result Area */}
            {quizData && activeTab === 'QUIZ' && (
               <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 animate-fade-in-up relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 relative z-10">
                     <h3 className="font-black text-xl text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                        <span>🎯</span> Interactive Quiz
                     </h3>
                     {quizSubmitted && (
                        <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 bg-white/50 dark:bg-gray-700/50 px-5 py-2 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 backdrop-blur-sm">
                           Score: {Object.keys(selectedAnswers).reduce((acc, qIdx) => acc + (selectedAnswers[qIdx] === quizData[qIdx].answerIndex ? 1 : 0), 0)} / {quizData.length}
                        </div>
                     )}
                  </div>
                  
                  <div className="space-y-8 relative z-10">
                     {quizData.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-3xl shadow-sm border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                           <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-5 leading-relaxed">
                              <span className="text-indigo-500 mr-2 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/50">{qIndex + 1}</span> {q.question}
                           </h4>
                           <div className="space-y-3">
                              {q.options.map((opt, oIndex) => {
                                 let btnClass = "w-full text-left px-5 py-4 rounded-xl font-bold transition-all border-2 outline-none ";
                                 const isSelected = selectedAnswers[qIndex] === oIndex;
                                 const isCorrect = q.answerIndex === oIndex;
                                 
                                 if (!quizSubmitted) {
                                    btnClass += isSelected 
                                       ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm" 
                                       : "border-transparent bg-white/50 text-gray-700 hover:bg-white hover:shadow-sm dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700";
                                 } else {
                                    if (isCorrect) {
                                       btnClass += "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 shadow-sm";
                                    } else if (isSelected && !isCorrect) {
                                       btnClass += "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 shadow-sm";
                                    } else {
                                       btnClass += "border-transparent bg-white/30 text-gray-500 dark:bg-gray-800/30 dark:text-gray-500 opacity-50";
                                    }
                                 }

                                 return (
                                    <button 
                                       key={oIndex}
                                       disabled={quizSubmitted}
                                       onClick={() => setSelectedAnswers({...selectedAnswers, [qIndex]: oIndex})}
                                       className={btnClass}
                                    >
                                       <span className="mr-3 font-bold opacity-50">{['A', 'B', 'C', 'D'][oIndex]}</span> {opt}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     ))}
                  </div>

                  {!quizSubmitted && Object.keys(selectedAnswers).length === quizData.length && (
                     <button 
                        onClick={() => {
                           setQuizSubmitted(true);
                           const score = Object.keys(selectedAnswers).reduce((acc, qIdx) => acc + (selectedAnswers[qIdx] === quizData[qIdx].answerIndex ? 1 : 0), 0);
                           if (score === quizData.length) toast.success("Perfect Score! 🏆");
                           else if (score >= quizData.length / 2) toast.success("Good job! 👍");
                           else toast.error("Keep studying! You can do better.");
                        }}
                        className="mt-8 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
                     >
                        Submit Quiz
                     </button>
                  )}
               </div>
            )}
         </div>

      </div>

    </div>
  );
};

export default StudyAssistant;
