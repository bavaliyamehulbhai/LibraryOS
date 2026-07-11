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

  const handlePayment = async () => {
    try {
      setLoading(true);
      const res = await api.post('/v1/member-dashboard/fines/pay');
      if (res.data.success) {
        toast.success(res.data.message || 'Payment successful!');
        // Refresh fines list after payment
        const finesRes = await api.get('/v1/member-dashboard/fines');
        if (finesRes.data.success) {
          setFines(finesRes.data.data);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const totalPending = fines.reduce((acc, fine) => acc + fine.pendingAmount, 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">💸</span> My Fines
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">View your fine history and pending payments.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4 items-center">
            <div className={`p-5 rounded-3xl shadow-lg border relative overflow-hidden flex flex-col justify-center group ${
              totalPending > 0 
                ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 shadow-red-500/10 dark:shadow-red-900/20' 
                : 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 shadow-emerald-500/10 dark:shadow-emerald-900/20'
            } backdrop-blur-xl`}>
              <div className={`absolute -right-4 -top-4 w-20 h-20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-500 ${
                totalPending > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'
              }`}></div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 relative z-10">Total Pending</div>
              <div className={`text-3xl font-black tracking-tight relative z-10 ${totalPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                ₹{totalPending}
              </div>
            </div>
            {totalPending > 0 && (
              <button 
                onClick={handlePayment}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider uppercase text-sm rounded-2xl shadow-sm hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Fines List */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-white/50 dark:border-gray-700/50 overflow-hidden">
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
                    <tr key={fine._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group cursor-default">
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
