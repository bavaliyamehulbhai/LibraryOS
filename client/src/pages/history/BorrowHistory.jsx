import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ACTION_CONFIG = {
  ISSUED:                { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',   icon: '📚', label: 'Issued'    },
  RETURNED:              { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: '✅', label: 'Returned'  },
  RENEWED:               { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', icon: '🔄', label: 'Renewed'  },
  RESERVED:              { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: '🔖', label: 'Reserved' },
  RESERVATION_CANCELLED: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',      icon: '❌', label: 'Cancelled' },
  RESERVATION_EXPIRED:   { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',       icon: '⏰', label: 'Expired'   },
};

const BorrowHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async (p = 1, action = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: p });
      if (action) params.append('action', action);

      const [histRes, dashRes] = await Promise.all([
        api.get(`/v1/history?${params}`),
        api.get('/v1/history/dashboard')
      ]);

      if (histRes.data.success) {
        setHistory(histRes.data.data);
        setTotal(histRes.data.total);
      }
      if (dashRes.data.success) setStats(dashRes.data.data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page, filter); }, [page, filter]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📖</span> Borrowing History
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Complete activity log of every book interaction in the library.</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Total Issued', value: stats.issued, icon: '📚', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Total Returned', value: stats.returned, icon: '✅', color: 'text-green-600 dark:text-green-400' },
              { label: 'Total Renewed', value: stats.renewed, icon: '🔄', color: 'text-yellow-600 dark:text-yellow-400' },
              { label: 'Total Reserved', value: stats.reserved, icon: '🔖', color: 'text-purple-600 dark:text-purple-400' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['', 'ISSUED', 'RETURNED', 'RENEWED', 'RESERVED'].map(action => (
            <button
              key={action}
              onClick={() => { setFilter(action); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                filter === action
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              {action ? (ACTION_CONFIG[action]?.icon + ' ' + ACTION_CONFIG[action]?.label) : '🔍 All Events'}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 dark:text-gray-500 self-center">{total} total records</span>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">Event</th>
                    <th className="p-4 font-medium">Date & Time</th>
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">Book</th>
                    <th className="p-4 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {history.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">No records found.</td></tr>
                  ) : (
                    history.map(event => {
                      const cfg = ACTION_CONFIG[event.action] || { color: 'bg-gray-100 text-gray-600', icon: '•', label: event.action };
                      return (
                        <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {new Date(event.actionDate).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Link to={`/history/member/${event.memberId?._id}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                              {event.memberId?.firstName} {event.memberId?.lastName}
                            </Link>
                            <div className="text-xs text-gray-400">{event.memberId?.memberCode}</div>
                          </td>
                          <td className="p-4 font-medium text-gray-700 dark:text-gray-300">{event.bookId?.title}</td>
                          <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{event.remarks}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > 50 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700">← Previous</button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 50)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 50)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowHistory;
