import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OverdueBooks = () => {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const res = await api.get('/v1/due-dates/overdue');
        if (res.data.success) setOverdueBooks(res.data.data);
      } catch (err) {
        toast.error('Failed to load overdue books');
      } finally {
        setLoading(false);
      }
    };
    fetchOverdue();
  }, []);

  const filtered = overdueBooks.filter(tx =>
    tx.member?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
    tx.member?.memberCode?.toLowerCase().includes(searchText.toLowerCase()) ||
    tx.book?.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getRiskBadge = (daysOverdue) => {
    if (daysOverdue >= 30) return <span className="bg-red-700 text-white text-xs font-bold px-2 py-0.5 rounded">HIGH RISK</span>;
    if (daysOverdue >= 14) return <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">MEDIUM</span>;
    return <span className="bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-0.5 rounded">LOW</span>;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🚨</span> Overdue Books
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">
              {overdueBooks.length} book{overdueBooks.length !== 1 ? 's' : ''} currently overdue.
            </p>
          </div>
          <Link to="/due-dates" className="text-blue-600 hover:underline dark:text-blue-400 text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by member name, ID, or book title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full max-w-lg px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-50 dark:bg-red-900/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-red-100 dark:border-red-800">
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">Book</th>
                    <th className="p-4 font-medium">Barcode</th>
                    <th className="p-4 font-medium">Due Date</th>
                    <th className="p-4 font-medium">Days Overdue</th>
                    <th className="p-4 font-medium">Risk</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-gray-500">
                        {overdueBooks.length === 0 ? '🎉 No overdue books!' : 'No matching results.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(tx => (
                      <tr key={tx._id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10 transition">
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{tx.member?.firstName} {tx.member?.lastName}</div>
                          <div className="text-xs text-gray-400">{tx.member?.memberCode}</div>
                          <div className="text-xs text-gray-400">{tx.member?.email}</div>
                        </td>
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{tx.book?.title}</td>
                        <td className="p-4 font-mono text-sm text-gray-500">{tx.barcode || '—'}</td>
                        <td className="p-4 font-bold text-red-600 dark:text-red-400">
                          {new Date(tx.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="text-2xl font-black text-red-600 dark:text-red-400">{tx.daysOverdue}</span>
                          <span className="text-gray-400 ml-1 text-sm">days</span>
                        </td>
                        <td className="p-4">{getRiskBadge(tx.daysOverdue)}</td>
                        <td className="p-4 text-right">
                          <Link to={`/fines?memberId=${tx.member?._id}`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            View Fines
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

export default OverdueBooks;
