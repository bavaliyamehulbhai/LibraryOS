import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MemberCatalog = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [reservedBookIds, setReservedBookIds] = useState(new Set());

  const fetchBooks = async (searchQuery = '') => {
    try {
      if (searchQuery) setSearching(true);
      else setLoading(true);
      
      const [booksRes, resvRes] = await Promise.all([
        api.get(`/v1/books${searchQuery ? `?search=${searchQuery}` : ''}`),
        api.get('/v1/member-dashboard/reservations').catch(() => ({ data: { data: [] } }))
      ]);

      if (booksRes.data.success) {
        setBooks(booksRes.data.data.books || booksRes.data.data || []);
      }
      
      if (resvRes.data && resvRes.data.success) {
        // Collect active reservations
        const activeRes = resvRes.data.data.filter(r => r.status === 'PENDING' || r.status === 'READY');
        const ids = new Set(activeRes.map(r => r.bookId._id || r.bookId));
        setReservedBookIds(ids);
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
        setReservedBookIds(prev => {
          const next = new Set(prev);
          next.add(bookId);
          return next;
        });
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
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center tracking-tight">
              Search <span className="text-blue-600 ml-2">Catalog</span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg dark:text-gray-400">Discover new books in the library network.</p>
          </div>
          <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full relative group">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all shadow-sm">
              <span className="pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search books, authors, or categories..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              />
              <button type="submit" className="mr-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50" disabled={searching}>
                {searching ? '...' : 'Search'}
              </button>
            </div>
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
              <div key={book._id} className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-black/60 hover:-translate-y-2 transition-all duration-500 group">
                <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700/50 relative flex justify-center items-center overflow-hidden border-b border-white/50 dark:border-gray-700/50">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                     <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                     </svg>
                  </div>
                  {book.coverImage && (
                    <img 
                       src={book.coverImage} 
                       alt={book.title} 
                       className="h-full w-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500" 
                       onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-20">
                    {book.totalCopies > book.issuedCopies ? (
                      <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">Available</span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-900/90 backdrop-blur-md text-gray-100 text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">Issued Out</span>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-4">By {book.author?.name || 'Unknown Author'}</p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                      <div>
                         <span className="block text-[10px] uppercase font-bold tracking-widest mb-0.5 opacity-70">Category</span>
                         <span className="font-medium text-gray-900 dark:text-gray-300">{book.category?.name || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                         <span className="block text-[10px] uppercase font-bold tracking-widest mb-0.5 opacity-70">Copies</span>
                         <span className="font-medium text-gray-900 dark:text-gray-300">{book.totalCopies - (book.issuedCopies || 0)} / {book.totalCopies}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleReserve(book._id)}
                      disabled={reservedBookIds.has(book._id)}
                      className={`w-full py-3 font-bold uppercase tracking-wider text-xs rounded-2xl shadow-sm transition-all duration-300 ${
                        reservedBookIds.has(book._id)
                          ? 'bg-gray-200/80 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed shadow-none'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white hover:shadow-lg hover:shadow-blue-500/30'
                      }`}
                    >
                      {reservedBookIds.has(book._id) ? 'Already Reserved' : 'Reserve Book'}
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
