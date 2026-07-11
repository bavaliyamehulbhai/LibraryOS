import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, FAQ, ARTICLES
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faqRes, articleRes] = await Promise.all([
        api.get(`/v1/knowledge/faqs?q=${searchQuery}`),
        api.get(`/v1/knowledge/articles?q=${searchQuery}`)
      ]);
      if (faqRes.data.success) setFaqs(faqRes.data.data);
      if (articleRes.data.success) setArticles(articleRes.data.data);
    } catch (error) {
      console.error("Failed to fetch knowledge base", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (articleId) => {
     navigate(`/help/${articleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-950 py-24 px-8 text-center shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute -right-20 -top-20 bg-white/10 w-96 h-96 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute -left-10 bottom-0 bg-indigo-400/20 w-64 h-64 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-md">How can we help you?</h1>
          <p className="text-indigo-100 mb-8 text-lg md:text-xl max-w-2xl mx-auto font-medium">Search our knowledge base for answers, policies, and guides.</p>
          <div className="max-w-2xl mx-auto relative group">
             <input 
                type="text" 
                placeholder="Search for articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-2xl text-lg shadow-2xl outline-none border-2 border-white/20 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/90 backdrop-blur-md focus:bg-white dark:focus:bg-gray-800 focus:border-blue-400 dark:focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 font-medium"
             />
             <Search className="absolute left-5 top-5 text-blue-500 dark:text-blue-400" size={24} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-8 relative z-20">
         {/* Tabs */}
         <div className="flex justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl inline-flex gap-1 border border-gray-100 dark:border-gray-700 dark:bg-gray-800/80">
               {["ALL", "FAQ", "ARTICLES"].map(tab => (
                  <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center p-12">
               <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Left Column: FAQs */}
               {(activeTab === "ALL" || activeTab === "FAQ") && (
                  <div className={`${activeTab === "FAQ" ? "lg:col-span-3 max-w-4xl mx-auto w-full" : "lg:col-span-1"} space-y-6`}>
                     <div className="flex items-center gap-3 mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                           <HelpCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Frequently Asked</h2>
                     </div>
                     
                     {faqs.length === 0 ? (
                        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                           <MessageCircle size={48} className="text-gray-300 mb-4" />
                           <p className="text-gray-500 font-medium">No FAQs found matching your search.</p>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {faqs.map(faq => (
                               <div key={faq._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all group">
                                 <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-start gap-2">
                                    <span className="text-blue-500 mt-1"><ChevronRight size={16} /></span>
                                    {faq.question}
                                 </h3>
                                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-6">{faq.answer}</p>
                                 <div className="pl-6 mt-4 flex items-center">
                                     <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">{faq.category}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* Right Column: Articles */}
               {(activeTab === "ALL" || activeTab === "ARTICLES") && (
                  <div className={`${activeTab === "ARTICLES" ? "lg:col-span-3 max-w-5xl mx-auto w-full" : "lg:col-span-2"} space-y-6`}>
                     <div className="flex items-center gap-3 mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                           <BookOpen size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Guides & Policies</h2>
                     </div>
                     
                     {articles.length === 0 ? (
                        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                           <BookOpen size={48} className="text-gray-300 mb-4" />
                           <p className="text-gray-500 font-medium">No articles found matching your search.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           {articles.map(article => (
                              <div key={article._id} onClick={() => handleArticleClick(article._id)} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer group flex flex-col hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                                 <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent dark:from-indigo-900/20 rounded-bl-full -z-0"></div>
                                 <div className="flex-1 relative z-10">
                                    <span className="inline-block mb-4 text-[10px] font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md uppercase tracking-wider">{article.category}</span>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{article.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">{article.content}</p>
                                 </div>
                                 <div className="mt-6 flex justify-between items-center text-xs text-gray-400 font-medium border-t border-gray-100 dark:border-gray-700 pt-4 relative z-10">
                                    <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md text-gray-500">👁️ {article.views} views</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read Article <ChevronRight size={14} /></span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

            </div>
         )}
      </div>
    </div>
  );
};

export default HelpCenter;
