import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ACTION_CONFIG = {
  ISSUED:                { dot: 'bg-blue-500',   icon: '📚', label: 'Issued'    },
  RETURNED:              { dot: 'bg-green-500',  icon: '✅', label: 'Returned'  },
  RENEWED:               { dot: 'bg-yellow-500', icon: '🔄', label: 'Renewed'   },
  RESERVED:              { dot: 'bg-purple-500', icon: '🔖', label: 'Reserved'  },
  RESERVATION_CANCELLED: { dot: 'bg-gray-400',   icon: '❌', label: 'Cancelled' },
  RESERVATION_EXPIRED:   { dot: 'bg-red-500',    icon: '⏰', label: 'Expired'   },
};

const MemberTimeline = () => {
  const { memberId } = useParams();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/v1/history/member/${memberId}`);
        if (res.data.success) {
          setEvents(res.data.data);
          setStats(res.data.stats);
        }
      } catch (err) {
        toast.error('Failed to load member timeline');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [memberId]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link to="/history" className="text-sm text-blue-600 hover:underline mb-4 inline-block dark:text-blue-400">← Back to History</Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📅</span> Member Reading Timeline
          </h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">Complete activity log for this member.</p>
        </div>

        {/* Stats & Badge */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reading Badge</p>
                <p className="text-3xl font-black" style={{ color: stats.badgeColor }}>{stats.badge}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reading Score</p>
                <p className="text-5xl font-black text-gray-900 dark:text-white">{stats.readingScore}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Books Issued', val: stats.totalIssued, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Books Returned', val: stats.totalReturned, color: 'text-green-600 dark:text-green-400' },
                { label: 'On-Time Returns', val: stats.onTimeReturns, color: 'text-teal-600 dark:text-teal-400' },
                { label: 'Renewals', val: stats.totalRenewed, color: 'text-yellow-600 dark:text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-center text-gray-400 py-12">No activity recorded for this member yet.</p>
              ) : (
                events.map((event, idx) => {
                  const cfg = ACTION_CONFIG[event.action] || { dot: 'bg-gray-400', icon: '•', label: event.action };
                  return (
                    <div key={event._id} className="relative pl-12">
                      <div className={`absolute left-2 top-4 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${cfg.dot}`}></div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{cfg.icon}</span>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {cfg.label}: {event.bookId?.title || 'Book'}
                              </p>
                              {event.remarks && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{event.remarks}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {new Date(event.actionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTimeline;
