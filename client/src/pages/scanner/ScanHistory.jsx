import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';

const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/v1/scanner/history');
        if (res.data.success) {
          setHistory(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch scan history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan History</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading history...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Scan Type</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Extracted ISBN/Title</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((scan, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                    {format(new Date(scan.createdAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="p-4 text-sm text-gray-900 dark:text-white font-medium">
                    {scan.userId?.firstName} {scan.userId?.lastName}
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold">
                      {scan.scanType}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                    {scan.extractedData?.title || scan.extractedData?.isbn || 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      scan.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      scan.status === 'DUPLICATE_FOUND' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No scan history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
