import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Since this is public, we use raw axios instead of our authenticated API interceptor
const API_URL = import.meta.env.VITE_API_URL || "/api";

const PublicPortal = () => {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, totalLibraries: 0, activeMembers: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useSelector(state => state.auth?.token);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [booksRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/v1/public/books`),
        axios.get(`${API_URL}/v1/public/stats`)
      ]);
      
      if (booksRes.data.success) setBooks(booksRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (error) {
      console.error("Failed to load public portal data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchInitialData();
    
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/v1/public/books/search?q=${searchQuery}`);
      if (res.data.success) setBooks(res.data.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      
      {/* Public Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">LibraryOS</span>
            </div>
            <div className="flex items-center gap-4">
              {token ? (
                <Link to="/member-dashboard" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 font-bold hover:text-blue-600 dark:hover:text-blue-400">Login</Link>
                  <Link to="/login" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md">Join Library</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-800 py-24 text-center px-4 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
               Discover Your Next <span className="text-blue-400">Great Read</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
               Search across millions of books, reserve your copy instantly, and explore collections curated just for you.
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-2xl flex items-center">
               <span className="pl-6 text-2xl text-gray-400">🔍</span>
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or keyword..." 
                  className="w-full p-4 text-lg outline-none text-gray-800 bg-transparent font-medium"
               />
               <button type="submit" className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors text-lg">
                  Search
               </button>
            </form>
         </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
         <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-3 gap-8 text-center divide-x divide-gray-200 dark:divide-gray-700">
               <div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.totalBooks.toLocaleString()}</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Books Available</div>
               </div>
               <div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.activeMembers.toLocaleString()}</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Members</div>
               </div>
               <div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.totalLibraries.toLocaleString()}</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Library Branches</div>
               </div>
            </div>
         </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
         <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? `Search Results for "${searchQuery}"` : "New Arrivals"}
               </h2>
               <p className="text-gray-500">Explore the latest additions to our collection.</p>
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
         ) : books.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
               <span className="text-6xl mb-4 block">🕵️‍♂️</span>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No books found</h3>
               <p className="text-gray-500">Try adjusting your search terms.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {books.map(book => {
                  // Fallback gradient based on first character of title
                  const firstChar = book.title ? book.title.charAt(0).toUpperCase() : 'A';
                  const gradients = [
                    'from-purple-500 to-indigo-600',
                    'from-pink-500 to-rose-600',
                    'from-blue-500 to-cyan-600',
                    'from-green-500 to-emerald-600',
                    'from-orange-500 to-amber-600',
                    'from-red-500 to-pink-600',
                  ];
                  const gradientClass = gradients[firstChar.charCodeAt(0) % gradients.length];
                  
                  return (
                  <Link to={`/portal/book/${book._id}`} key={book._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                     <div className={`aspect-[2/3] relative overflow-hidden bg-gradient-to-br ${gradientClass}`}>
                        {book.coverImage ? (
                           <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              onError={(e) => {
                                 e.target.style.display = 'none'; // Hide broken image so gradient shows
                                 e.target.nextElementSibling.style.display = 'flex'; // Show fallback text
                              }}
                           />
                        ) : null}
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center absolute top-0 left-0" style={{ display: book.coverImage ? 'none' : 'flex' }}>
                           <span className="text-5xl mb-2 shadow-sm drop-shadow-md">📖</span>
                           <span className="font-extrabold text-white text-sm drop-shadow-md leading-tight">{book.title}</span>
                           <span className="font-medium text-white/80 text-xs mt-1 drop-shadow-md">{book.author?.name}</span>
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 z-10">
                           {book.status === 'AVAILABLE' ? (
                              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">Available</span>
                           ) : (
                              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">Issued</span>
                           )}
                        </div>
                     </div>
                     <div className="p-4">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">{book.category?.name || "General"}</p>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                           {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mb-2">{book.author?.name || "Unknown Author"}</p>
                        {book.libraryId && (
                           <div className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1.5 rounded-lg w-full truncate">
                              <span className="mr-1.5">🏢</span>
                              <span className="truncate">{book.libraryId.name}</span>
                           </div>
                        )}
                     </div>
                  </Link>
               )})}
            </div>
         )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center border-t border-gray-800">
         <p className="font-bold text-white mb-2 text-xl flex items-center justify-center gap-2">
            <span className="text-2xl">📚</span> LibraryOS
         </p>
         <p>Powering the next generation of modern libraries.</p>
      </footer>
    </div>
  );
};

export default PublicPortal;
