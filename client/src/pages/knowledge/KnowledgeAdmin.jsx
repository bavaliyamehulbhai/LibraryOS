import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, MessageCircle, Send, CheckCircle, Clock } from 'lucide-react';

const KnowledgeAdmin = () => {
  const [activeTab, setActiveTab] = useState("ARTICLE"); // ARTICLE, FAQ
  
  // Article State
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleCategory, setArticleCategory] = useState("");
  
  // FAQ State
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const endpoint = activeTab === "ARTICLE" ? '/v1/knowledge/articles' : '/v1/knowledge/faqs';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!articleTitle || !articleContent || !articleCategory) return toast.error("All fields required");
    
    setLoading(true);
    try {
      const payload = {
        title: articleTitle,
        slug: articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: articleContent,
        category: articleCategory,
        status: "PUBLISHED"
      };
      const res = await api.post('/v1/knowledge/articles', payload);
      if (res.data.success) {
        toast.success("Article published!");
        setArticleTitle("");
        setArticleContent("");
        setArticleCategory("");
        fetchHistory();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating article");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFAQ = async (e) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer || !faqCategory) return toast.error("All fields required");
    
    setLoading(true);
    try {
      const payload = {
        question: faqQuestion,
        answer: faqAnswer,
        category: faqCategory
      };
      const res = await api.post('/v1/knowledge/faqs', payload);
      if (res.data.success) {
        toast.success("FAQ published!");
        setFaqQuestion("");
        setFaqAnswer("");
        setFaqCategory("");
        fetchHistory();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 bg-white/10 w-64 h-64 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute -left-10 bottom-0 bg-indigo-400/20 w-40 h-40 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-3 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><BookOpen size={32} /></div> 
            Knowledge Admin
          </h1>
          <p className="text-indigo-100 text-lg">Publish policies, guides, and FAQs to the Help Center.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Composer */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
           <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
              <button 
                 onClick={() => setActiveTab("ARTICLE")}
                 className={`flex-1 flex items-center justify-center gap-2 py-5 font-bold transition-all ${activeTab === 'ARTICLE' ? 'border-b-4 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
              >
                 <BookOpen size={18} /> Create Article
              </button>
              <button 
                 onClick={() => setActiveTab("FAQ")}
                 className={`flex-1 flex items-center justify-center gap-2 py-5 font-bold transition-all ${activeTab === 'FAQ' ? 'border-b-4 border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
              >
                 <MessageCircle size={18} /> Create FAQ
              </button>
           </div>

         <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50">
            {activeTab === "ARTICLE" && (
               <form onSubmit={handleCreateArticle} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Article Title</label>
                        <input 
                           type="text" 
                           value={articleTitle}
                           onChange={(e) => setArticleTitle(e.target.value)}
                           className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                           placeholder="e.g. Fine Policy 2026"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
                        <select 
                           value={articleCategory}
                           onChange={(e) => setArticleCategory(e.target.value)}
                           className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                        >
                           <option value="">Select Category...</option>
                           <option value="Policies">Policies</option>
                           <option value="Guides">Guides</option>
                           <option value="SOPs">SOPs</option>
                           <option value="Rules">Rules</option>
                        </select>
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Content (Markdown Supported)</label>
                     <textarea 
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        className="w-full h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 resize-y font-mono text-sm"
                        placeholder="Write your article content here..."
                     ></textarea>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full ml-auto disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                     {loading ? <span className="animate-spin text-xl">⏳</span> : <><Send size={18} /> Publish Article</>}
                  </button>
               </form>
            )}

            {activeTab === "FAQ" && (
               <form onSubmit={handleCreateFAQ} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Question</label>
                     <input 
                        type="text" 
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                        placeholder="e.g. How many books can I issue?"
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
                     <select 
                        value={faqCategory}
                        onChange={(e) => setFaqCategory(e.target.value)}
                        className="w-full md:w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                     >
                        <option value="">Select Category...</option>
                        <option value="Membership">Membership</option>
                        <option value="Circulation">Circulation</option>
                        <option value="Digital Library">Digital Library</option>
                        <option value="General">General</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Answer</label>
                     <textarea 
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        className="w-full h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 resize-y"
                        placeholder="Provide a clear and concise answer..."
                     ></textarea>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full ml-auto disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                     {loading ? <span className="animate-spin text-xl">⏳</span> : <><Send size={18} /> Publish FAQ</>}
                  </button>
               </form>
            )}
         </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
           <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Clock className="text-gray-500 dark:text-gray-400" size={20} />
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Published {activeTab === "ARTICLE" ? "Articles" : "FAQs"}</h2>
              </div>
           </div>
           
           <div className="flex-1 p-6 overflow-y-auto max-h-[600px] space-y-4">
              {loadingHistory ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
              ) : history.length === 0 ? (
                <div className="text-center p-12 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                   <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      {activeTab === "ARTICLE" ? <BookOpen size={24} className="text-gray-400" /> : <MessageCircle size={24} className="text-gray-400" />}
                   </div>
                   <p className="font-bold text-gray-700 dark:text-gray-300">No {activeTab.toLowerCase()}s found</p>
                   <p className="text-sm">Publish your first {activeTab.toLowerCase()} to see it here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item._id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg pr-4 line-clamp-1">{activeTab === "ARTICLE" ? item.title : item.question}</h3>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded whitespace-nowrap ${activeTab === 'ARTICLE' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{activeTab === "ARTICLE" ? item.content : item.answer}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500 font-medium mt-auto">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                      {activeTab === "ARTICLE" && (
                         <div className="flex items-center text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                           👁️ {item.views} views
                         </div>
                      )}
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeAdmin;
