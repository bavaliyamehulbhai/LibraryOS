import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, FAQ, ARTICLES

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
     // Fetch the article to increment views
     try {
        await api.get(`/v1/knowledge/articles/${articleId}`);
     } catch (e) {
        console.error(e);
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 py-20 px-8 text-center shadow-inner">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">How can we help you?</h1>
        <div className="max-w-2xl mx-auto relative">
           <input 
              type="text" 
              placeholder="Search for articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-14 py-4 rounded-full text-lg shadow-xl outline-none border-2 border-transparent focus:border-indigo-300 transition-all text-gray-900 bg-white"
           />
           <span className="absolute right-6 top-4 text-2xl text-gray-400">🔍</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-8 relative z-10">
         {/* Tabs */}
         <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg inline-flex gap-2 border border-gray-100 dark:border-gray-700">
               {["ALL", "FAQ", "ARTICLES"].map(tab => (
                  <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
                  <div className={`${activeTab === "FAQ" ? "lg:col-span-3 max-w-3xl mx-auto w-full" : "lg:col-span-1"} space-y-6`}>
                     <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">💬</span>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Frequently Asked</h2>
                     </div>
                     {faqs.length === 0 ? (
                        <p className="text-gray-500 text-sm bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">No FAQs found matching your search.</p>
                     ) : (
                        <div className="space-y-4">
                           {faqs.map(faq => (
                              <div key={faq._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                 <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{faq.question}</h3>
                                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                                 <span className="inline-block mt-3 text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">{faq.category}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* Right Column: Articles */}
               {(activeTab === "ALL" || activeTab === "ARTICLES") && (
                  <div className={`${activeTab === "ARTICLES" ? "lg:col-span-3 max-w-4xl mx-auto w-full" : "lg:col-span-2"} space-y-6`}>
                     <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📚</span>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Guides & Policies</h2>
                     </div>
                     {articles.length === 0 ? (
                        <p className="text-gray-500 text-sm bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">No articles found matching your search.</p>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {articles.map(article => (
                              <div key={article._id} onClick={() => handleArticleClick(article._id)} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer group flex flex-col">
                                 <div className="flex-1">
                                    <span className="inline-block mb-3 text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase tracking-wider">{article.category}</span>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{article.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">{article.content}</p>
                                 </div>
                                 <div className="mt-6 flex justify-between items-center text-xs text-gray-400 font-medium border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <span>👁️ {article.views} views</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline">Read Article →</span>
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
