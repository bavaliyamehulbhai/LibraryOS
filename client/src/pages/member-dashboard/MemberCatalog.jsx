import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MemberCatalog = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchBooks = async (searchQuery = '') => {
    try {
      if (searchQuery) setSearching(true);
      else setLoading(true);
      
      const res = await api.get(`/v1/books${searchQuery ? `?search=${searchQuery}` : ''}`);
      if (res.data.success) {
        setBooks(res.data.data.books || res.data.data || []);
      }
    } catch (error) {
      console.error("Catalog error:", error);
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(query);
  };

  const handleReserve = async (bookId) => {
    try {
      const res = await api.post('/v1/member-dashboard/reservations', { bookId });
      if (res.data.success) {
        toast.success('Book reserved successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve book');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🔍</span> Search Catalog
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">Discover new books in the library.</p>
          </div>
          <form onSubmit={handleSearch} className="flex-1 max-w-lg w-full relative">
            <input 
              type="text" 
              placeholder="Search books, authors, or categories..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="absolute left-4 top-3.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button type="submit" className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50" disabled={searching}>
              {searching ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No books found</h3>
              <p>Try adjusting your search terms.</p>
            </div>
          ) : (
            books.map(book => (
              <div key={book._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-md transition">
                <div className="h-48 bg-gray-100 dark:bg-gray-700 relative flex justify-center">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="h-full object-cover w-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {book.totalCopies > book.issuedCopies ? (
                      <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-sm">Available</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-800 text-gray-100 text-xs font-bold rounded shadow-sm">Issued Out</span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">By {book.author?.name || 'Unknown Author'}</p>
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      <span>Category: {book.category?.name || 'N/A'}</span>
                      <span>Copies: {book.totalCopies - (book.issuedCopies || 0)} / {book.totalCopies}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleReserve(book._id)}
                      className="w-full py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                    >
                      Reserve Book
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCatalog;
