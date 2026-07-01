import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RealtimeFeed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchFeed = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/v1/circulation-dashboard/feed');
      if (res.data.success) {
        setFeed(res.data.data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      if (showLoading) toast.error('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(true);
    // Poll every 10 seconds to simulate real-time
    const interval = setInterval(() => fetchFeed(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action) => {
    switch(action) {
      case 'ISSUED': return '📤';
      case 'RETURNED': return '📥';
      case 'RENEWED': return '🔄';
      case 'FINE_GENERATED': return '⚠️';
      case 'FINE_PAID': return '💰';
      default: return '📝';
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'ISSUED': return 'bg-blue-100 text-blue-800';
      case 'RETURNED': return 'bg-green-100 text-green-800';
      case 'RENEWED': return 'bg-purple-100 text-purple-800';
      case 'FINE_GENERATED': return 'bg-red-100 text-red-800';
      case 'FINE_PAID': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3 text-red-500 animate-pulse">🔴</span> Live Activity Feed
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Monitoring library transactions in real-time.</p>
          </div>
          <div className="text-xs font-bold text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
          
          {loading && feed.length === 0 ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div>
          ) : feed.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No recent activity.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[70vh] overflow-y-auto p-4">
              {feed.map((item, index) => (
                <div key={item._id} className="py-4 flex gap-4 items-start group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl shadow-inner">
                      {getActionIcon(item.action)}
                    </div>
                    {index !== feed.length - 1 && <div className="w-0.5 h-12 bg-gray-100 dark:bg-gray-700 mt-2"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {item.member}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getActionColor(item.action)}`}>
                        {(item.action || 'UNKNOWN').replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.details}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeFeed;
