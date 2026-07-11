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
      <div className="relative pt-40 pb-32 text-center px-4 overflow-hidden bg-white dark:bg-[#09090b]">
         {/* Premium Glowing Backgrounds */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-rose-500/30 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse-slow"></div>
         
         <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-wide">
              ✨ Welcome to the future of libraries
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-tight drop-shadow-sm">
               Read. <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">Discover.</span> Evolve.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
               Access an infinite universe of knowledge. Search across thousands of books and resources in milliseconds.
            </p>

            <form onSubmit={handleSearch} className="max-w-4xl mx-auto relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-2 rounded-[2rem] shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex items-center transition-all">
                  <span className="pl-8 text-3xl text-gray-400 dark:text-gray-500">⌘</span>
                  <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search title, author, or keyword..." 
                     className="w-full px-6 py-5 text-xl md:text-2xl outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 bg-transparent font-medium"
                  />
                  <button type="submit" className="px-8 py-5 md:px-12 bg-black dark:bg-white text-white dark:text-black font-bold rounded-[1.5rem] shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg shrink-0 flex items-center">
                     Explore <span className="ml-2">→</span>
                  </button>
               </div>
            </form>
         </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-[#09090b] border-y border-gray-100 dark:border-gray-800">
         <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-3 gap-8 text-center divide-x divide-gray-100 dark:divide-gray-800">
               <div>
                  <div className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{stats.totalBooks.toLocaleString()}</div>
                  <div className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Books Available</div>
               </div>
               <div>
                  <div className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{stats.activeMembers.toLocaleString()}</div>
                  <div className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Members</div>
               </div>
               <div>
                  <div className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{stats.totalLibraries.toLocaleString()}</div>
                  <div className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Library Branches</div>
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
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
         ) : books.length === 0 ? (
            <div className="text-center py-20 bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
               <span className="text-6xl mb-4 block">🕵️‍♂️</span>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No books found</h3>
               <p className="text-gray-500">Try adjusting your search terms.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
               {books.map(book => {
                  const firstChar = book.title ? book.title.charAt(0).toUpperCase() : 'A';
                  const gradients = [
                    'from-indigo-500 to-purple-600',
                    'from-pink-500 to-rose-600',
                    'from-blue-500 to-cyan-600',
                    'from-emerald-500 to-teal-600',
                    'from-orange-500 to-amber-600',
                    'from-violet-500 to-fuchsia-600',
                  ];
                  const gradientClass = gradients[firstChar.charCodeAt(0) % gradients.length];
                  
                  return (
                  <Link to={`/portal/book/${book._id}`} key={book._id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full">
                     <div className={`aspect-[2/3] relative overflow-hidden bg-gradient-to-br ${gradientClass}`}>
                        {book.coverImage ? (
                           <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                              onError={(e) => {
                                 e.target.style.display = 'none';
                                 e.target.nextElementSibling.style.display = 'flex';
                              }}
                           />
                        ) : null}
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center absolute top-0 left-0 bg-black/10 backdrop-blur-sm" style={{ display: book.coverImage ? 'none' : 'flex' }}>
                           <span className="text-6xl mb-4 shadow-sm drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500">📖</span>
                           <span className="font-extrabold text-white text-lg drop-shadow-lg leading-tight tracking-tight">{book.title}</span>
                           <span className="font-medium text-white/90 text-sm mt-2 drop-shadow-md">{book.author?.name}</span>
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-10">
                           {book.status === 'AVAILABLE' ? (
                              <span className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/20">Available</span>
                           ) : (
                              <span className="bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/20">Issued</span>
                           )}
                        </div>
                     </div>
                     <div className="p-6 flex flex-col flex-grow">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-widest">{book.category?.name || "General"}</p>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                           {book.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-4 font-medium">{book.author?.name || "Unknown Author"}</p>
                        <div className="mt-auto">
                           {book.libraryId && (
                              <div className="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm px-3 py-2 rounded-xl w-full truncate border border-gray-200/50 dark:border-gray-600/50">
                                 <span className="mr-2 opacity-70">🏢</span>
                                 <span className="truncate">{book.libraryId.name}</span>
                              </div>
                           )}
                        </div>
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
