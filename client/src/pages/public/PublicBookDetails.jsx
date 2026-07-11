import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || "/api";

const PublicBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector(state => state.auth?.token);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/v1/public/books/${id}`);
      if (res.data.success) {
        setBook(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load book details");
      navigate('/portal');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
     if (token) {
        try {
           const res = await api.post('/v1/member-dashboard/reservations', { bookId: book._id });
           if (res.data.success) {
              toast.success('Book reserved successfully! Redirecting...', { icon: '🎉' });
              setTimeout(() => navigate('/member-dashboard'), 1500); // Redirect to member dashboard
           }
        } catch (error) {
           toast.error(error.response?.data?.message || 'Failed to reserve book');
        }
     } else {
        toast.error("Please login to reserve this book.", {
           icon: '🔒',
           duration: 4000
        });
        setTimeout(() => navigate('/login'), 1500);
     }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  }

  if (!book) return null;

  // Fallback gradient logic
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20">
      
      {/* Public Navbar Minimal */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/portal" className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">LibraryOS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/portal" className="text-gray-600 dark:text-gray-300 font-bold hover:text-blue-600">Back to Catalog</Link>
              {token ? (
                <Link to="/member-dashboard" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md">Go to Dashboard</Link>
              ) : (
                <Link to="/login" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md">Login</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-12 relative z-10">
         <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden flex flex-col md:flex-row relative">
            
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br ${gradientClass} opacity-20 dark:opacity-10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none`}></div>

            {/* Book Cover */}
            <div className={`md:w-1/3 p-8 md:p-12 flex justify-center items-center relative bg-gradient-to-br ${gradientClass} shadow-inner`}>
               <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
               {book.coverImage && (
                  <img 
                     src={book.coverImage} 
                     alt={book.title} 
                     className="w-full max-w-sm rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 transform hover:scale-105 transition-transform duration-500 ease-out" 
                     onError={(e) => {
                        e.target.style.display = 'none'; // Hide broken image
                        const fallbackText = document.getElementById('fallback-text');
                        if(fallbackText) fallbackText.style.display = 'flex';
                     }}
                  />
               )}
               <div id="fallback-text" className="w-full h-full flex flex-col items-center justify-center p-6 text-center absolute top-0 left-0 z-10 bg-black/20 backdrop-blur-md" style={{ display: book.coverImage ? 'none' : 'flex' }}>
                  <span className="text-8xl mb-6 shadow-sm drop-shadow-2xl">📖</span>
                  <span className="font-extrabold text-white text-4xl drop-shadow-2xl leading-tight tracking-tight">{book.title}</span>
                  <span className="font-semibold text-white/90 text-2xl mt-4 drop-shadow-xl">{book.author?.name}</span>
               </div>
            </div>

            {/* Book Details */}
            <div className="md:w-2/3 p-10 lg:p-16 flex flex-col relative z-10">
               <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-indigo-200 dark:border-indigo-800/50">
                     {book.category?.name || "General"}
                  </span>
                  {book.status === 'AVAILABLE' ? (
                     <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-emerald-200 dark:border-emerald-800/50 shadow-sm">Available</span>
                  ) : (
                     <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-amber-200 dark:border-amber-800/50 shadow-sm">Currently Issued</span>
                  )}
               </div>

               <h1 className="text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-4 leading-tight tracking-tight">
                  {book.title}
               </h1>
               <h2 className="text-2xl lg:text-3xl text-indigo-600 dark:text-indigo-400 mb-8 font-bold">
                  By {book.author?.name || "Unknown Author"}
               </h2>

               <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-10 max-w-3xl font-medium">
                  {book.description || "No description available for this book. Visit the library to read the physical copy or reserve it online."}
               </p>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-md p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                     <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">ISBN</span>
                     <span className="font-bold text-gray-900 dark:text-white text-lg">{book.isbn}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-md p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                     <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Pages</span>
                     <span className="font-bold text-gray-900 dark:text-white text-lg">{book.pages || "N/A"}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-md p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                     <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Language</span>
                     <span className="font-bold text-gray-900 dark:text-white text-lg">{book.language || "English"}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-md p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                     <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Branch</span>
                     <span className="font-bold text-gray-900 dark:text-white text-base block truncate" title={book.libraryId?.name}>{book.libraryId?.name || "Main Library"}</span>
                  </div>
               </div>

               <div className="mt-auto flex flex-col sm:flex-row gap-4 relative z-[100]">
                  <button 
                     onClick={handleReserve}
                     disabled={book.status === 'LOST' || book.status === 'MAINTENANCE'}
                     className="relative z-[100] px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all text-lg flex items-center justify-center min-w-[240px] transform hover:-translate-y-1 cursor-pointer"
                  >
                     {book.status === 'AVAILABLE' ? "Reserve (Hold Request)" : book.status === 'ISSUED' ? "Join Waitlist" : "Not Available"}
                  </button>
                  <Link 
                     to="/portal"
                     className="relative z-[100] px-10 py-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 font-bold rounded-2xl transition-all text-lg flex justify-center items-center backdrop-blur-sm cursor-pointer"
                  >
                     Keep Browsing
                  </Link>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default PublicBookDetails;
