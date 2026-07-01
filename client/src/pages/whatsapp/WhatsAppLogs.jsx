import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WhatsAppLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/v1/whatsapp/logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load WhatsApp logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'READ': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">✓✓ Read</span>;
      case 'DELIVERED': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">✓✓ Delivered</span>;
      case 'SENT': return <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-200">✓ Sent</span>;
      case 'PENDING': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Pending</span>;
      case 'FAILED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Failed</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-green-500">📜</span> WhatsApp Logs
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">View recent WhatsApp messages and verify read receipts.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">No WhatsApp logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sent At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-mono text-xs">{log.messageCode}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.phone}</td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-[300px] bg-green-50 dark:bg-green-900/10 p-2 rounded text-xs border border-green-100 dark:border-green-800/50">
                          {log.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status)}
                        {log.errorMessage && <p className="text-xs text-red-500 mt-1">{log.errorMessage}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
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

export default WhatsAppLogs;
