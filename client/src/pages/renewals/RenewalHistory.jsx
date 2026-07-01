import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RenewalHistory = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/renewals/history');
      if (res.data.success) {
        setRenewals(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load renewal history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🕒</span> Renewal History
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Log of all extended borrowing periods across the library.</p>
          </div>
          <Link to="/renewals/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
            <span className="mr-2">🔄</span> Renew Book
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
                    <th className="p-4 font-medium">Last Renewed</th>
                    <th className="p-4 font-medium">New Due Date</th>
                    <th className="p-4 font-medium">Count</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {renewals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No renewals found.
                      </td>
                    </tr>
                  ) : (
                    renewals.map(record => (
                      <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-4 font-mono font-medium text-gray-900 dark:text-white">{record.transactionCode}</td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">{record.bookId?.title}</td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900 dark:text-white">{record.memberId?.firstName} {record.memberId?.lastName}</div>
                          <div className="text-xs text-gray-500">{record.memberId?.memberCode}</div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {record.renewalHistory && record.renewalHistory.length > 0 
                            ? new Date(record.renewalHistory[record.renewalHistory.length - 1].renewedAt).toLocaleString()
                            : '-'}
                        </td>
                        <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                          {new Date(record.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">
                            {record.renewalCount}x
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link to={`/renewals/${record._id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium text-sm">
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

export default RenewalHistory;
