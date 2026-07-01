import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/v1/emails/logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load email logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OPENED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Opened</span>;
      case 'SENT': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Sent</span>;
      case 'FAILED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Failed</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📋</span> Email Logs
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">View recent outgoing emails and their delivery status.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">No email logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sent At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-mono text-xs">{log.emailCode}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.recipient}</td>
                      <td className="px-6 py-4 truncate max-w-[200px]">{log.subject}</td>
                      <td className="px-6 py-4 text-xs bg-gray-100 dark:bg-gray-700 rounded my-3 inline-block px-2">{log.templateName}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status)}
                        {log.errorMessage && <p className="text-xs text-red-500 mt-1">{log.errorMessage}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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

export default EmailLogs;
