import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MemberFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const res = await api.get('/v1/member-dashboard/fines');
        if (res.data.success) {
          setFines(res.data.data);
        }
      } catch (error) {
        console.error("Fines error:", error);
        toast.error(error.response?.data?.message || 'Failed to load fine history');
      } finally {
        setLoading(false);
      }
    };
    fetchFines();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const totalPending = fines.reduce((acc, fine) => acc + fine.pendingAmount, 0);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">💸</span> My Fines
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">View your fine history and pending payments.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Pending</div>
              <div className={`text-2xl font-bold ${totalPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                ₹{totalPending}
              </div>
            </div>
            {totalPending > 0 && (
              <button className="px-6 py-4 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 transition">
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Fines List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {fines.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Clean Slate!</h3>
              <p>You have never received any fines. Great job returning books on time!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Related Book</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {fines.map(fine => (
                    <tr key={fine._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {new Date(fine.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {fine.reason || 'Late Return'}
                      </td>
                      <td className="px-6 py-4">
                        {fine.transactionId?.bookId?.title ? (
                          <span className="truncate max-w-[200px] block" title={fine.transactionId.bookId.title}>
                            {fine.transactionId.bookId.title}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        ₹{fine.amount}
                      </td>
                      <td className="px-6 py-4">
                        {fine.status === 'PENDING' || fine.status === 'PARTIAL' ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold uppercase">
                            {fine.status} (₹{fine.pendingAmount} Left)
                          </span>
                        ) : fine.status === 'WAIVED' ? (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-bold uppercase">
                            Waived
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase">
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MemberFines;
