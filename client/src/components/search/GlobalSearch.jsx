import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch, useSearchSuggestions } from "../../hooks/useSearch";
import { Search, Book, User, Building, MapPin, Tag, FileText, Sparkles } from "lucide-react";

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Instant Search Queries
  const { data: searchData, isLoading } = useGlobalSearch(query);
  const { data: suggestionsData } = useSearchSuggestions(query);

  const results = searchData?.data || { books: [], authors: [], publishers: [], copies: [], members: [], transactions: [] };
  const suggestions = suggestionsData?.data || [];

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const hasResults = results.books?.length > 0 || results.authors?.length > 0 || results.publishers?.length > 0 || results.copies?.length > 0 || results.members?.length > 0 || results.transactions?.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search books, authors, copies, ISBN..."
          className="w-full pl-10 pr-12 py-2 border dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700/80 dark:text-white dark:placeholder-gray-400 transition shadow-sm"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
        <div className="absolute right-3 top-2.5 pointer-events-none">
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-bold px-1.5 py-0.5 rounded shadow-sm border dark:border-gray-600">⌘K</span>
        </div>
      </form>

      {isOpen && query.length > 1 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-black/40 border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b">
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSuggestionClick(sug)}
                  className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <Search size={14} className="text-gray-400" />
                  {sug}
                </div>
              ))}
            </div>
          )}

          {/* Instant Search Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {isLoading && <div className="p-4 text-center text-sm text-gray-500">Searching ecosystem...</div>}
            
            {!isLoading && !hasResults && query.length > 2 && (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500 mb-3">No exact matches found.</p>
                <button 
                  onClick={() => { setIsOpen(false); navigate(`/search?q=${encodeURIComponent(query)}&semantic=true`); }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  <Sparkles size={16} /> Try AI Semantic Search
                </button>
              </div>
            )}

            {results.books.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Books</h4>
                {results.books.slice(0, 3).map(book => (
                  <div key={book._id} onClick={() => { setIsOpen(false); navigate(`/books/${book._id}`); }} className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded"><Book size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{book.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{book.isbn}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.authors.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Authors</h4>
                {results.authors.slice(0, 2).map(author => (
                  <div key={author._id} onClick={() => { setIsOpen(false); navigate(`/authors/${author._id}`); }} className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded"><User size={16} /></div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{author.name}</p>
                  </div>
                ))}
              </div>
            )}

            {results.copies?.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Physical Copies</h4>
                {results.copies.slice(0, 2).map(copy => (
                  <div key={copy._id} onClick={() => { setIsOpen(false); navigate(`/copies/${copy._id}`); }} className="flex items-center gap-3 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded"><Tag size={16} /></div>
                    <div>
                      <p className="text-sm font-bold font-mono text-gray-800 dark:text-gray-100">{copy.copyCode}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{copy.bookId?.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.members?.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Members</h4>
                {results.members.slice(0, 2).map(member => (
                  <div key={member._id} onClick={() => { setIsOpen(false); navigate(`/members/${member._id}`); }} className="flex items-center gap-3 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded"><User size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.transactions?.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Transactions</h4>
                {results.transactions.slice(0, 2).map(txn => (
                  <div key={txn._id} onClick={() => { setIsOpen(false); navigate(`/issues/${txn._id}`); }} className="flex items-center gap-3 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded"><FileText size={16} /></div>
                    <div>
                      <p className="text-sm font-bold font-mono text-gray-800 dark:text-gray-100">{txn._id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{txn.bookId?.title || "Book"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div 
            className="p-3 bg-gray-50 dark:bg-gray-900 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer border-t dark:border-gray-700"
            onClick={handleSearch}
          >
            View all results for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
