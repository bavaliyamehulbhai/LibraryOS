import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">✍️</span> Knowledge Admin
          </h1>
          <p className="text-gray-500 mt-2">Publish policies, guides, and FAQs to the Help Center.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button 
               onClick={() => setActiveTab("ARTICLE")}
               className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'ARTICLE' ? 'border-b-4 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
               Create Article
            </button>
            <button 
               onClick={() => setActiveTab("FAQ")}
               className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'FAQ' ? 'border-b-4 border-purple-600 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
               Create FAQ
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
                     className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 w-full md:w-auto ml-auto"
                  >
                     {loading ? "Publishing..." : "Publish Article 🚀"}
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
                     className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 w-full md:w-auto ml-auto"
                  >
                     {loading ? "Publishing..." : "Publish FAQ ✨"}
                  </button>
               </form>
            )}
         </div>
      </div>
    </div>
  );
};

export default KnowledgeAdmin;
