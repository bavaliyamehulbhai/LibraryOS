import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReturnHistory = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/returns');
      if (res.data.success) {
        setReturns(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load return history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Return History</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">View recently returned books and fines collected.</p>
          </div>
          <Link to="/returns/new" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center font-bold hover:shadow-lg hover:-translate-y-0.5">
            <span className="mr-2">📥</span> Return Book
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                    <th className="p-5">Transaction</th>
                    <th className="p-5">Book</th>
                    <th className="p-5">Member</th>
                    <th className="p-5">Returned On</th>
                    <th className="p-5">Fine</th>
                    <th className="p-5">Condition</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No return records found.
                      </td>
                    </tr>
                  ) : (
                    returns.map(record => (
                      <tr key={record._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 group">
                        <td className="p-5 font-mono font-bold text-gray-900 dark:text-white">{record.transactionCode}</td>
                        <td className="p-5">
                          <div className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{record.bookId?.title}</div>
                          <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">{record.bookCopyId?.barcode}</div>
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-gray-900 dark:text-white">{record.memberId?.firstName} {record.memberId?.lastName}</div>
                          <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">{record.memberId?.memberCode}</div>
                        </td>
                        <td className="p-5 font-medium text-gray-600 dark:text-gray-300">
                          {new Date(record.actualReturnDate).toLocaleDateString()}
                          {record.lateDays > 0 && <span className="ml-2 px-2 py-0.5 rounded bg-red-50 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800">{record.lateDays}d late</span>}
                        </td>
                        <td className="p-5 font-black text-lg">
                          {record.fineAmount > 0 ? (
                            <span className="text-red-600 dark:text-red-400">₹{record.fineAmount}</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">₹0</span>
                          )}
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm border ${
                            record.returnCondition === 'GOOD' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30' :
                            record.returnCondition === 'DAMAGED' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30' :
                            'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30'
                          }`}>
                            {record.returnCondition}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <Link to={`/returns/${record._id}`} className="inline-block px-4 py-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-lg shadow-sm transition-all hover:shadow">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnHistory;
