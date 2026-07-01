import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/v1/marketplace/books?search=${search}`);
      if (res.data.success) {
        setBooks(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load marketplace catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">🛒</span> B2B Book Marketplace
          </h1>
          <p className="text-gray-500 mt-2">Discover, compare, and procure books for your library.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/marketplace/cart')}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold rounded-lg transition shadow-sm hover:shadow-md flex items-center"
          >
            <span className="mr-2">🛍️</span> My Cart
          </button>
          <button 
            onClick={() => navigate('/marketplace/orders')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md"
          >
            My Orders
          </button>
        </div>
      </div>

      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search by Title, Category, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">📚</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Books Found</h2>
          <p className="text-gray-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div 
              key={book._id} 
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col h-full group"
              onClick={() => navigate(`/marketplace/books/${book._id}`)}
            >
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col justify-center items-center p-6 relative">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="h-full object-contain drop-shadow-lg" />
                ) : (
                  <span className="text-6xl shadow-sm rounded bg-white dark:bg-gray-800 p-4 inline-block">📘</span>
                )}
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-bold px-3 py-1 rounded-full text-sm shadow-sm">
                  ₹{book.price}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">{book.category}</span>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">{book.author}</p>
                
                <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="mr-1">🏢</span> {book.vendorId?.companyName || "Unknown Vendor"}
                    </span>
                    <span className={`font-bold ${book.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {book.stock > 0 ? `${book.stock} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
