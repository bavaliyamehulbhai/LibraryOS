import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GRNManagement = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState([]);

  // Form State
  const [selectedPo, setSelectedPo] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchGRNs();
    fetchOrders();
  }, []);

  const fetchGRNs = async () => {
    try {
      const res = await api.get('/v1/procurement/grn');
      if (res.data.success) {
        setGrns(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load GRNs");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/v1/marketplace/orders');
      if (res.data.success) {
        // Only allow GRN for orders that are PENDING/SHIPPED (not yet DELIVERED)
        setOrders(res.data.data.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePoSelect = (poId) => {
    setSelectedPo(poId);
    const order = orders.find(o => o._id === poId);
    if (order) {
      // Pre-fill GRN items based on PO
      setItems(order.items.map(item => ({
        bookTitle: item.bookId?.title || "Unknown",
        quantityReceived: item.quantity,
        condition: "Good"
      })));
    } else {
      setItems([]);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPo) return toast.error("Please select a Purchase Order");

    try {
      const res = await api.post('/v1/procurement/grn', {
        poId: selectedPo,
        items
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowModal(false);
        fetchGRNs();
        fetchOrders();
        setSelectedPo("");
        setItems([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create GRN");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">📦</span> Goods Receipt (GRN)
          </h1>
          <p className="text-gray-500 mt-2">Log received books and sync physical inventory automatically.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-md shadow-green-500/30 flex items-center"
        >
          <span className="mr-2">➕</span> Log Goods Receipt
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
      ) : grns.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No GRNs Logged</h2>
          <p className="text-gray-500">You haven't received any purchase orders yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">GRN #</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Date Received</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">PO Reference</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Total Items</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Received By</th>
              </tr>
            </thead>
            <tbody>
              {grns.map((grn) => (
                <tr key={grn._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{grn.grnNumber}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{new Date(grn.receivedDate).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{grn.purchaseOrderId?.orderNumber || "Unknown PO"}</td>
                  <td className="p-4 font-bold text-green-600 dark:text-green-400">
                     {grn.items.reduce((sum, i) => sum + i.quantityReceived, 0)} units
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{grn.receivedBy?.firstName}</td>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <span className="text-2xl">📦</span> Receive Shipment
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="grnForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Purchase Order</label>
                  <select 
                    value={selectedPo} 
                    onChange={(e) => handlePoSelect(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    <option value="" disabled>Select a pending PO...</option>
                    {orders.map(o => (
                       <option key={o._id} value={o._id}>{o.orderNumber} - ₹{o.totalAmount}</option>
                    ))}
                  </select>
                </div>

                {items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Verify Received Items</h3>
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl mb-4 text-sm font-medium">
                       Upon submission, these items will automatically be added to your physical Library Inventory.
                    </div>
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 mb-4 items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                          <input type="text" readOnly value={item.bookTitle} className="w-full p-2 bg-transparent outline-none font-bold text-gray-900 dark:text-white" />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-bold text-gray-500 mb-1">Qty Received</label>
                          <input type="number" min="0" required value={item.quantityReceived} onChange={(e) => updateItem(idx, 'quantityReceived', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div className="w-40">
                          <label className="block text-xs font-bold text-gray-500 mb-1">Condition</label>
                          <select value={item.condition} onChange={(e) => updateItem(idx, 'condition', e.target.value)} className="w-full p-2 border rounded-lg">
                             <option>Good</option>
                             <option>Damaged</option>
                             <option>Missing Pages</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button form="grnForm" type="submit" disabled={!selectedPo} className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md">Confirm & Sync Inventory</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GRNManagement;
