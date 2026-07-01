import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/v1/marketplace/orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <button onClick={() => navigate('/marketplace')} className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Catalog</button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">📦</span> Purchase Orders
          </h1>
          <p className="text-gray-500 mt-2">Track your procurement requests and deliveries.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-16 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">🧾</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Found</h2>
          <p className="text-gray-500">You haven't placed any purchase orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-8">
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Number</span>
                    <span className="font-bold text-gray-900 dark:text-white">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date Placed</span>
                    <span className="font-bold text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</span>
                    <span className="font-bold text-green-600 dark:text-green-400">₹{order.totalAmount}</span>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Items Ordered</div>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                        {item.bookId?.coverImage ? (
                          <img src={item.bookId.coverImage} alt={item.bookId.title} className="h-full object-contain" />
                        ) : (
                          <span className="text-xl">📘</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{item.bookId?.title || "Unknown Book"}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        ₹{item.quantity * item.price}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
                  <span>Vendor: <strong>{order.vendorId?.companyName || "Unknown"}</strong></span>
                  <button className="text-blue-600 hover:underline font-medium">View Invoice PDF</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
