import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/v1/marketplace/books/${id}`);
        if (res.data.success) {
          setBook(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load book details");
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const addToCart = () => {
    // In a real app, you'd persist cart to DB or Context. We'll use localStorage for this MVP.
    const cart = JSON.parse(localStorage.getItem('library_marketplace_cart') || '[]');
    const existing = cart.find(i => i.bookId === id);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ bookId: id, quantity, book });
    }
    
    localStorage.setItem('library_marketplace_cart', JSON.stringify(cart));
    toast.success("Added to procurement cart!");
    navigate('/marketplace/cart');
  };

  if (loading) return <div className="p-20 text-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div>;
  if (!book) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      <button onClick={() => navigate('/marketplace')} className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Catalog</button>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
        
        {/* Cover Section */}
        <div className="md:w-2/5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-12 border-r border-gray-100 dark:border-gray-700">
           {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="max-w-full drop-shadow-2xl" />
           ) : (
              <span className="text-9xl shadow-xl rounded-xl bg-white dark:bg-gray-800 p-12 inline-block">📘</span>
           )}
        </div>

        {/* Details Section */}
        <div className="md:w-3/5 p-10 flex flex-col">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">{book.category}</span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">By {book.author}</p>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">₹{book.price}</h2>
            <p className="text-sm text-gray-500 mt-1">per copy</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="block text-gray-500 mb-1">Publisher</span>
              <span className="font-bold text-gray-900 dark:text-white">{book.publisher || "Unknown"}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="block text-gray-500 mb-1">ISBN</span>
              <span className="font-bold text-gray-900 dark:text-white">{book.isbn}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 col-span-2 flex items-center justify-between">
              <div>
                <span className="block text-gray-500 mb-1">Supplied By</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">{book.vendorId?.companyName}</span>
              </div>
              <div className="text-right">
                <span className="text-yellow-500 text-xl font-bold">★ {book.vendorId?.rating}</span>
                <span className="block text-xs text-gray-500">Vendor Rating</span>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-8 flex gap-4 items-center">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded">-</button>
              <span className="px-4 font-bold min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(book.stock, quantity + 1))} className="px-4 py-2 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded">+</button>
            </div>
            
            <button 
              onClick={addToCart}
              disabled={book.stock === 0}
              className={`flex-1 font-bold py-4 rounded-xl transition shadow-md text-lg flex justify-center items-center ${book.stock === 0 ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'}`}
            >
              <span className="mr-2">🛒</span> {book.stock === 0 ? 'Out of Stock' : 'Add to Procurement Cart'}
            </button>
          </div>
          <p className="text-center mt-3 text-sm text-gray-500">{book.stock} units available from this vendor</p>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
