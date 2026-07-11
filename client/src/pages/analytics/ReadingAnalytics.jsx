import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, CheckCircle, Percent, Trophy } from 'lucide-react';

const ReadingAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/v1/analytics/reading');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load reading analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!data) return <div className="text-center p-12 text-gray-500">No data available</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📖</span> Reading Analytics
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Discover top readers and circulation trends.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Total Issues</p>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400"><BookOpen size={20} /></div>
            </div>
            <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400">{data.totalIssues}</h2>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-green-100 dark:border-green-800/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-green-600 transition-colors">Total Returns</p>
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400"><CheckCircle size={20} /></div>
            </div>
            <h2 className="text-4xl font-black text-green-600 dark:text-green-400">{data.totalReturns}</h2>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-purple-100 dark:border-purple-800/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Completion Rate</p>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400"><Percent size={20} /></div>
            </div>
            <h2 className="text-4xl font-black text-purple-600 dark:text-purple-400">{data.completionRate}%</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3 text-yellow-600 dark:text-yellow-500">
                <Trophy size={20} />
              </div>
              Top 10 Readers Leaderboard
            </h3>
          </div>
          <div className="p-0">
            {data.topReaders && data.topReaders.length > 0 ? (
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Member Name</th>
                    <th className="px-6 py-4">Member ID</th>
                    <th className="px-6 py-4">Books Borrowed</th>
                    <th className="px-6 py-4">Reading Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.topReaders.map((reader, index) => (
                    <tr key={reader._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-black text-lg text-gray-400">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{reader.name}</td>
                      <td className="px-6 py-4 font-mono text-xs">{reader.memberCode}</td>
                      <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{reader.borrowCount}</td>
                      <td className="px-6 py-4">
                        {reader.borrowCount > 20 ? (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-200">Gold Reader</span>
                        ) : reader.borrowCount > 10 ? (
                          <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-bold border border-gray-300">Silver Reader</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold border border-orange-200">Bronze Reader</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-12 text-center text-gray-500">No reading activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingAnalytics;
