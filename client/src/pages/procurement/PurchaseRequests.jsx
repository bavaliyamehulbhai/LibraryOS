import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [category, setCategory] = useState("Books");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState([{ bookTitle: "", author: "", quantity: 1, estimatedPrice: 0 }]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/v1/procurement/requests');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { bookTitle: "", author: "", quantity: 1, estimatedPrice: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.estimatedPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const estimatedCost = calculateTotal();
      const res = await api.post('/v1/procurement/requests', {
        category,
        reason,
        items,
        estimatedCost
      });
      
      if (res.data.success) {
        toast.success("Purchase Request Submitted!");
        setShowModal(false);
        fetchRequests();
        setItems([{ bookTitle: "", author: "", quantity: 1, estimatedPrice: 0 }]);
        setReason("");
      }
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">📝</span> Purchase Requests
          </h1>
          <p className="text-gray-500 mt-2">Submit and track requests for library materials.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/30 flex items-center"
        >
          <span className="mr-2">➕</span> New Request
        </button>
      </div>

      {loading ? (
         <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
      ) : requests.length === 0 ? (
         <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Requests Found</h2>
            <p className="text-gray-500">You haven't submitted any purchase requests yet.</p>
         </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Request #</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Category</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Est. Cost</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{req.requestNumber}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{req.category}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">₹{req.estimatedCost}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Purchase Request</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="prForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    >
                      <option>Books</option>
                      <option>Journals</option>
                      <option>Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason / Justification</label>
                    <input 
                      type="text" 
                      required 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                      placeholder="e.g. New syllabus requirements"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Items</h3>
                    <button type="button" onClick={addItem} className="text-blue-600 font-bold hover:underline">+ Add Item</button>
                  </div>
                  
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 mb-4 items-end bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                        <input type="text" required value={item.bookTitle} onChange={(e) => updateItem(idx, 'bookTitle', e.target.value)} className="w-full p-2 border rounded-lg" />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Qty</label>
                        <input type="number" min="1" required value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Est. Price</label>
                        <input type="number" min="0" required value={item.estimatedPrice} onChange={(e) => updateItem(idx, 'estimatedPrice', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white mb-2 ml-4">
                        ₹{item.quantity * item.estimatedPrice}
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-right text-xl font-bold mt-4">
                    Total Estimated Cost: <span className="text-green-600">₹{calculateTotal()}</span>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button form="prForm" type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md">Submit Request</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseRequests;
