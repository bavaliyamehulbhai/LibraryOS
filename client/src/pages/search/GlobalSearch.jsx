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

      <div className="max-w-3xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative shadow-2xl rounded-full overflow-hidden flex bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 focus-within:border-blue-500 transition-colors">
          <span className="pl-6 flex items-center text-3xl">🔍</span>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchMode === "EXACT" ? "Search by title, author, or keyword..." : "Describe what you want to learn (e.g. books for backend interviews)..."}
            className="w-full p-5 text-xl outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-lg transition-colors"
          >
            {loading ? "Searching..." : "Search"}
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
                    <Link to={`/books/${book._id}`} key={book._id} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-16 h-24 object-cover rounded shadow-sm" />
                      ) : (
                        <div className="w-16 h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xl">📘</div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400 line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">By {book.author?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{book.description}</p>
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
                    <Link to={`/repository/${paper._id}`} key={paper._id} className="flex gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="text-3xl">📄</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                           <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 line-clamp-1 flex-1 pr-4">{paper.title}</h3>
                           <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded">
                              {paper.publicationYear}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{paper.authors.join(", ")}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{paper.abstract}</p>
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
