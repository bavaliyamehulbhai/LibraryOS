import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/v1/procurement/requests');
      if (res.data.success) {
        setRequests(res.data.data.filter(req => req.status === 'SUBMITTED'));
      }
    } catch (error) {
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/v1/procurement/requests/${id}/approve`);
      if (res.data.success) {
        toast.success("Request Approved & Budget Updated");
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-4xl">✅</span> Pending Approvals
        </h1>
        <p className="text-gray-500 mt-2">Review purchase requests and allocate budget.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <span className="text-6xl mb-4 inline-block opacity-50">🎉</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Caught Up!</h2>
          <p className="text-gray-500">There are no pending purchase requests to approve.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 md:w-3/4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{req.requestNumber} • {new Date(req.createdAt).toLocaleDateString()}</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{req.category} Request</h3>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{req.estimatedCost.toLocaleString()}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <strong className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Reason</strong>
                  {req.reason}
                </p>

                <div className="space-y-2">
                  <strong className="text-sm text-gray-900 dark:text-white">Requested Items:</strong>
                  {req.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <span>{item.quantity} × {item.bookTitle}</span>
                      <span>₹{item.estimatedPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 md:w-1/4 bg-gray-50 dark:bg-gray-900/50 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 flex flex-col justify-center gap-4">
                <div className="text-center mb-2">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Requested By</span>
                  <span className="font-medium text-gray-900 dark:text-white">{req.requestedBy?.firstName} {req.requestedBy?.lastName}</span>
                </div>
                <button 
                  onClick={() => handleApprove(req._id)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Approve Request
                </button>
                <button className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 font-bold rounded-xl hover:bg-red-50 transition">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
