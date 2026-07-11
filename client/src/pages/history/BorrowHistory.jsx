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
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">📖</span> Borrowing History
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Complete activity log of every book interaction in the library.</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
            {[
              { label: 'Total Issued', value: stats.issued, icon: '📚', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Total Returned', value: stats.returned, icon: '✅', color: 'text-green-600 dark:text-green-400' },
              { label: 'Total Renewed', value: stats.renewed, icon: '🔄', color: 'text-yellow-600 dark:text-yellow-400' },
              { label: 'Total Reserved', value: stats.reserved, icon: '🔖', color: 'text-purple-600 dark:text-purple-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-white/50 dark:border-gray-700 hover:shadow-xl transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
                  <span className="text-6xl">{s.icon}</span>
                </div>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">{s.label}</h3>
                <p className={`text-5xl font-black ${s.color} relative z-10`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-8 relative z-10">
          {['', 'ISSUED', 'RETURNED', 'RENEWED', 'RESERVED'].map(action => (
            <button
              key={action}
              onClick={() => { setFilter(action); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all transform hover:-translate-y-0.5 ${
                filter === action
                  ? 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 shadow-md'
                  : 'bg-white/80 backdrop-blur-xl dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-white/50 dark:border-gray-700 hover:shadow-sm'
              }`}
            >
              {action ? (ACTION_CONFIG[action]?.icon + ' ' + ACTION_CONFIG[action]?.label) : '🔍 All Events'}
            </button>
          ))}
          <span className="ml-auto text-sm font-bold text-gray-500 dark:text-gray-400 self-center bg-gray-200/50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">{total} total records</span>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden relative z-10">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                    <th className="p-5">Event</th>
                    <th className="p-5">Date & Time</th>
                    <th className="p-5">Member</th>
                    <th className="p-5">Book</th>
                    <th className="p-5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {history.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">No records found.</td></tr>
                  ) : (
                    history.map(event => {
                      const cfg = ACTION_CONFIG[event.action] || { color: 'bg-gray-100 text-gray-600', icon: '•', label: event.action };
                      return (
                        <tr key={event._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 group">
                          <td className="p-5">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm border ${cfg.color} border-opacity-50`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </td>
                          <td className="p-5 text-gray-600 dark:text-gray-300 whitespace-nowrap font-medium">
                            {new Date(event.actionDate).toLocaleString()}
                          </td>
                          <td className="p-5">
                            <Link to={`/history/member/${event.memberId?._id}`} className="font-extrabold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {event.memberId?.firstName} {event.memberId?.lastName}
                            </Link>
                            <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">{event.memberId?.memberCode}</div>
                          </td>
                          <td className="p-5 font-bold text-gray-700 dark:text-gray-300">{event.bookId?.title}</td>
                          <td className="p-5 text-sm font-medium text-gray-500 dark:text-gray-400">{event.remarks}</td>
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
