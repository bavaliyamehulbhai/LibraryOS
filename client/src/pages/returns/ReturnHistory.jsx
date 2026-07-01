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
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Return History</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">View recently returned books and fines collected.</p>
          </div>
          <Link to="/returns/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
            <span className="mr-2">📥</span> Return Book
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">Transaction</th>
                    <th className="p-4 font-medium">Book</th>
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">Returned On</th>
                    <th className="p-4 font-medium">Fine</th>
                    <th className="p-4 font-medium">Condition</th>
                    <th className="p-4 font-medium text-right">Actions</th>
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
                      <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-4 font-mono font-medium text-gray-900 dark:text-white">{record.transactionCode}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{record.bookId?.title}</div>
                          <div className="text-xs text-gray-500">{record.bookCopyId?.barcode}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900 dark:text-white">{record.memberId?.firstName} {record.memberId?.lastName}</div>
                          <div className="text-xs text-gray-500">{record.memberId?.memberCode}</div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {new Date(record.actualReturnDate).toLocaleDateString()}
                          {record.lateDays > 0 && <span className="ml-2 text-xs text-red-500">({record.lateDays}d late)</span>}
                        </td>
                        <td className="p-4 font-bold">
                          {record.fineAmount > 0 ? (
                            <span className="text-red-600 dark:text-red-400">₹{record.fineAmount}</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">₹0</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            record.returnCondition === 'GOOD' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                            record.returnCondition === 'DAMAGED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30'
                          }`}>
                            {record.returnCondition}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link to={`/returns/${record._id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium text-sm">
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
