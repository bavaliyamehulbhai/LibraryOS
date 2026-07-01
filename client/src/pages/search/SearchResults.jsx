import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGlobalSearch } from "../../hooks/useSearch";
import { Book, User, Building, MapPin, Tag, Search as SearchIcon, AlertCircle } from "lucide-react";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);

  const { data: searchData, isLoading } = useGlobalSearch(q);
  const results = searchData?.data || { books: [], authors: [], publishers: [], categories: [], copies: [] };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const hasResults = results.books.length > 0 || 
                     results.authors.length > 0 || 
                     results.publishers.length > 0 || 
                     results.categories.length > 0 || 
                     results.copies.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Advanced Search Engine</h1>
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition shadow-sm"
            placeholder="Search anything (Atomic Habits, James Clear, 978123...)"
          />
          <SearchIcon className="absolute left-4 top-4.5 text-gray-400" size={24} />
          <button type="submit" className="absolute right-3 top-3 bg-blue-600 text-white px-6 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition">
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-500 flex flex-col items-center">
          <SearchIcon size={48} className="animate-pulse mb-4 opacity-20" />
          <p className="text-lg">Searching LibraryOS Ecosystem...</p>
        </div>
      ) : (
        <>
          {q && !hasResults ? (
            <div className="bg-white border rounded-lg p-10 text-center shadow-sm">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-700">No matching records found</h2>
              <p className="text-gray-500 mt-2">We couldn't find any books, authors, publishers, or copies matching "{q}".</p>
              <ul className="text-sm text-gray-400 mt-4 list-disc list-inside">
                <li>Check your spelling (fuzzy search handles some errors, but not all).</li>
                <li>Try searching for a broader term.</li>
                <li>Try searching by exact ISBN or Barcode.</li>
              </ul>
            </div>
          ) : (
            q && (
              <div className="space-y-8">
                <p className="text-gray-500">Showing top results across the platform for <strong className="text-gray-800">"{q}"</strong></p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Books & Copies (Primary Assets) */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Books */}
                    {results.books.length > 0 && (
                      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center gap-2">
                          <Book className="text-blue-600" size={20} />
                          <h2 className="font-bold text-blue-900">Books ({results.books.length})</h2>
                        </div>
                        <div className="divide-y">
                          {results.books.map(book => (
                            <Link to={`/books/${book._id}`} key={book._id} className="block p-4 hover:bg-gray-50 transition">
                              <div className="flex items-start gap-4">
                                {book.coverImage ? (
                                  <img src={book.coverImage} className="w-16 h-24 object-cover rounded shadow-sm" alt="cover" />
                                ) : (
                                  <div className="w-16 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-300"><Book size={24}/></div>
                                )}
                                <div>
                                  <h3 className="font-bold text-lg text-blue-700 hover:underline">{book.title}</h3>
                                  <p className="text-sm text-gray-600 mb-1">{book.author?.name || "Unknown Author"}</p>
                                  <div className="flex gap-3 text-xs text-gray-500 mt-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded font-mono">ISBN: {book.isbn}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded">{book.category?.name || "Uncategorized"}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Physical Copies */}
                    {results.copies.length > 0 && (
                      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
                          <Tag className="text-green-600" size={20} />
                          <h2 className="font-bold text-green-900">Physical Copies ({results.copies.length})</h2>
                        </div>
                        <div className="divide-y">
                          {results.copies.map(copy => (
                            <Link to={`/copies/${copy._id}`} key={copy._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                              <div>
                                <h3 className="font-mono font-bold text-gray-900 text-lg">{copy.copyCode}</h3>
                                <p className="text-sm text-gray-600">{copy.bookId?.title}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${copy.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {copy.status}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right Column: Entities */}
                  <div className="space-y-8">
                    
                    {/* Authors */}
                    {results.authors.length > 0 && (
                      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 flex items-center gap-2">
                          <User className="text-purple-600" size={20} />
                          <h2 className="font-bold text-purple-900">Authors ({results.authors.length})</h2>
                        </div>
                        <div className="divide-y">
                          {results.authors.map(author => (
                            <Link to={`/authors/${author._id}`} key={author._id} className="block p-4 hover:bg-gray-50 transition">
                              <h3 className="font-bold text-gray-800">{author.name}</h3>
                              {author.country && <p className="text-xs text-gray-500 mt-1">{author.country}</p>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Publishers */}
                    {results.publishers.length > 0 && (
                      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center gap-2">
                          <Building className="text-orange-600" size={20} />
                          <h2 className="font-bold text-orange-900">Publishers ({results.publishers.length})</h2>
                        </div>
                        <div className="divide-y">
                          {results.publishers.map(pub => (
                            <Link to={`/publishers/${pub._id}`} key={pub._id} className="block p-4 hover:bg-gray-50 transition">
                              <h3 className="font-bold text-gray-800">{pub.name}</h3>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
