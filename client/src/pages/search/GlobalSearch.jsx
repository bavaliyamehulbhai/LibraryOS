import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("EXACT"); // EXACT or SEMANTIC
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const endpoint = searchMode === "EXACT" ? "/v1/search/global" : "/v1/search/semantic";
      const res = await api.get(`${endpoint}?q=${encodeURIComponent(query)}`);
      
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      
      <div className="text-center mb-12 pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Library<span className="text-blue-600">Search</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Instantly discover books, research papers, theses, and digital content across the entire library network.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-16 relative z-10">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10 rounded-full"></div>
        <form onSubmit={handleSearch} className="relative shadow-2xl rounded-full overflow-hidden flex bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
          <span className="pl-6 flex items-center text-2xl text-blue-500">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchMode === "EXACT" ? "Search by title, author, or keyword..." : "Describe what you want to learn..."}
            className="w-full p-5 text-xl font-medium outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-black uppercase tracking-wider text-lg transition-all"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        <div className="flex justify-center mt-6 gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
               type="radio" 
               name="searchMode" 
               checked={searchMode === "EXACT"} 
               onChange={() => setSearchMode("EXACT")}
               className="w-4 h-4 text-blue-600"
            />
            <span className={`font-bold ${searchMode === "EXACT" ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`}>Exact Match</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
               type="radio" 
               name="searchMode" 
               checked={searchMode === "SEMANTIC"} 
               onChange={() => setSearchMode("SEMANTIC")}
               className="w-4 h-4 text-purple-600"
            />
            <span className={`font-bold flex items-center gap-1 ${searchMode === "SEMANTIC" ? "text-purple-600 dark:text-purple-400" : "text-gray-500"}`}>
               ✨ AI Semantic Search
            </span>
          </label>
        </div>
      </div>

      {results && (
        <div className="space-y-12 animate-fade-in-up">
          
          {searchMode === "SEMANTIC" && results.keywords && (
             <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 text-purple-800 dark:text-purple-300 flex gap-2 flex-wrap items-center text-sm font-medium">
                <span className="font-bold mr-2">Grok interpreted your query as:</span>
                {results.keywords.map(kw => (
                   <span key={kw} className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">{kw}</span>
                ))}
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Books Column */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-end">
                <span>📚 Books</span>
                <span className="text-sm font-normal text-gray-500">{results.books.length} results</span>
              </h2>
              <div className="space-y-4">
                {results.books.length === 0 ? (
                  <p className="text-gray-500 p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">No books found.</p>
                ) : (
                  results.books.map(book => (
                    <Link to={`/portal/book/${book._id}`} key={book._id} className="flex gap-5 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
                      <div className="w-20 h-28 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 shadow-sm relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">📘</div>
                        {book.coverImage && (
                          <img 
                            src={book.coverImage} 
                            alt={book.title} 
                            className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-300" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">By {book.author?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{book.description || "No description available."}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Research Column */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-end">
                <span>🔬 Research & Publications</span>
                <span className="text-sm font-normal text-gray-500">{results.research.length} results</span>
              </h2>
              <div className="space-y-4">
                {results.research.length === 0 ? (
                  <p className="text-gray-500 p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">No research found.</p>
                ) : (
                  results.research.map(paper => (
                    <Link to={`/repository/${paper._id}`} key={paper._id} className="flex gap-5 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                           <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{paper.title}</h3>
                           <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded flex-shrink-0">
                              {paper.publicationYear}
                           </span>
                        </div>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2 truncate">{paper.authors?.join(", ") || "Unknown Authors"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{paper.abstract}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
