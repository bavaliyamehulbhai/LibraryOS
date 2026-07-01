import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('library_marketplace_cart') || '[]');
    setCart(savedCart);
  }, []);

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    
    if (newCart[index].quantity < 1) {
      newCart.splice(index, 1);
    }
    
    setCart(newCart);
    localStorage.setItem('library_marketplace_cart', JSON.stringify(newCart));
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('library_marketplace_cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.book.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const items = cart.map(c => ({ bookId: c.bookId, quantity: c.quantity }));
      const res = await api.post('/v1/marketplace/order', { items });
      
      if (res.data.success) {
        toast.success("Purchase Order Created!");
        localStorage.removeItem('library_marketplace_cart');
        setCart([]);
        navigate('/marketplace/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-8">
        <button onClick={() => navigate('/marketplace')} className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Catalog</button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-4xl">🛍️</span> Procurement Cart
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-16 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">🛒</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Browse the marketplace to find books for your library.</p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-2/3 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-6 items-center">
                <div className="w-20 h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  {item.book.coverImage ? (
                    <img src={item.book.coverImage} alt={item.book.title} className="h-full object-contain" />
                  ) : (
                    <span className="text-3xl">📘</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.book.title}</h3>
                  <p className="text-sm text-gray-500">{item.book.author} | {item.book.vendorId?.companyName}</p>
                  <p className="font-bold text-green-600 dark:text-green-400 mt-2">₹{item.book.price}</p>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-sm font-bold">Remove</button>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button onClick={() => updateQuantity(index, -1)} className="px-3 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded">-</button>
                    <span className="px-3 font-bold text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, 1)} className="px-3 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-medium">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping & Handling</span>
                  <span className="font-medium">₹0.00</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">Total Amount</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-2xl">₹{calculateTotal()}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/30 flex justify-center items-center"
              >
                {loading ? 'Processing...' : 'Create Purchase Order'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-4">By creating this PO, you agree to the marketplace terms.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
