import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch, useSearchSuggestions } from "../../hooks/useSearch";
import { Search, Book, User, Building, MapPin, Tag } from "lucide-react";

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Instant Search Queries
  const { data: searchData, isLoading } = useGlobalSearch(query);
  const { data: suggestionsData } = useSearchSuggestions(query);

  const results = searchData?.data || { books: [], authors: [], publishers: [], copies: [] };
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

  const hasResults = results.books.length > 0 || results.authors.length > 0 || results.publishers.length > 0 || results.copies.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search books, authors, copies, ISBN..."
          className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </form>

      {isOpen && query.length > 1 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b">
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSuggestionClick(sug)}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
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
              <div className="p-4 text-center text-sm text-gray-500">No matching records found.</div>
            )}

            {results.books.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Books</h4>
                {results.books.slice(0, 3).map(book => (
                  <div key={book._id} onClick={() => { setIsOpen(false); navigate(`/books/${book._id}`); }} className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><Book size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{book.title}</p>
                      <p className="text-xs text-gray-500 font-mono">{book.isbn}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.authors.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Authors</h4>
                {results.authors.slice(0, 2).map(author => (
                  <div key={author._id} onClick={() => { setIsOpen(false); navigate(`/authors/${author._id}`); }} className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-purple-100 text-purple-600 rounded"><User size={16} /></div>
                    <p className="text-sm font-bold text-gray-800">{author.name}</p>
                  </div>
                ))}
              </div>
            )}

            {results.copies.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Physical Copies</h4>
                {results.copies.slice(0, 2).map(copy => (
                  <div key={copy._id} onClick={() => { setIsOpen(false); navigate(`/copies/${copy._id}`); }} className="flex items-center gap-3 p-2 hover:bg-green-50 rounded cursor-pointer transition">
                    <div className="p-1.5 bg-green-100 text-green-600 rounded"><Tag size={16} /></div>
                    <div>
                      <p className="text-sm font-bold font-mono text-gray-800">{copy.copyCode}</p>
                      <p className="text-xs text-gray-500">{copy.bookId?.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div 
            className="p-3 bg-gray-50 text-center text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer border-t"
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
