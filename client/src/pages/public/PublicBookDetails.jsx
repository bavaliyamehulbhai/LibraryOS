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

      <div className="max-w-7xl mx-auto px-4 pt-12">
         <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
            
            {/* Book Cover */}
            <div className={`md:w-1/3 p-12 flex justify-center items-center relative bg-gradient-to-br ${gradientClass}`}>
               {book.coverImage && (
                  <img 
                     src={book.coverImage} 
                     alt={book.title} 
                     className="w-full max-w-sm rounded-lg shadow-2xl relative z-10" 
                     onError={(e) => {
                        e.target.style.display = 'none'; // Hide broken image
                        const fallbackText = document.getElementById('fallback-text');
                        if(fallbackText) fallbackText.style.display = 'flex';
                     }}
                  />
               )}
               <div id="fallback-text" className="w-full h-full flex flex-col items-center justify-center p-4 text-center absolute top-0 left-0" style={{ display: book.coverImage ? 'none' : 'flex' }}>
                  <span className="text-7xl mb-4 shadow-sm drop-shadow-md">📖</span>
                  <span className="font-extrabold text-white text-3xl drop-shadow-md leading-tight">{book.title}</span>
                  <span className="font-medium text-white/80 text-xl mt-2 drop-shadow-md">{book.author?.name}</span>
               </div>
            </div>

            {/* Book Details */}
            <div className="md:w-2/3 p-10 lg:p-16 flex flex-col">
               <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                     {book.category?.name || "General"}
                  </span>
                  {book.status === 'AVAILABLE' ? (
                     <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Available</span>
                  ) : (
                     <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Currently Issued</span>
                  )}
               </div>

               <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                  {book.title}
               </h1>
               <h2 className="text-2xl text-gray-600 dark:text-gray-400 mb-8 font-medium">
                  By {book.author?.name || "Unknown Author"}
               </h2>

               <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-10 max-w-3xl">
                  {book.description || "No description available for this book. Visit the library to read the physical copy or reserve it online."}
               </p>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                     <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ISBN</span>
                     <span className="font-bold text-gray-900 dark:text-white">{book.isbn}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                     <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pages</span>
                     <span className="font-bold text-gray-900 dark:text-white">{book.pages || "N/A"}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                     <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Language</span>
                     <span className="font-bold text-gray-900 dark:text-white">{book.language || "English"}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                     <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Branch</span>
                     <span className="font-bold text-gray-900 dark:text-white truncate" title={book.libraryId?.name}>{book.libraryId?.name || "Main Library"}</span>
                  </div>
               </div>

               <div className="mt-auto flex gap-4">
                  <button 
                     onClick={handleReserve}
                     disabled={book.status !== 'AVAILABLE'}
                     className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-lg flex items-center justify-center min-w-[200px]"
                  >
                     {book.status === 'AVAILABLE' ? "Reserve Book" : "Not Available"}
                  </button>
                  <Link 
                     to="/portal"
                     className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 font-bold rounded-xl transition-all text-lg text-center"
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
