import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Rankings = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/v1/branch-analytics/ranking');
        if (res.data.success) {
          setRankings(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load rankings');
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">🏆</span> Branch Rankings
          </h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">Top performing branches based on revenue, issues, and member engagement.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  <th className="px-6 py-4 w-16 text-center">Rank</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Performance Score</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Total Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rankings.map((branch, index) => (
                  <tr key={branch.branchId} className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition ${index === 0 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      {index === 0 ? <span className="text-2xl" title="1st Place">🥇</span> : 
                       index === 1 ? <span className="text-2xl" title="2nd Place">🥈</span> : 
                       index === 2 ? <span className="text-2xl" title="3rd Place">🥉</span> : 
                       <span className="font-bold text-gray-500">#{index + 1}</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {branch.branchName}
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded font-normal">{branch.branchCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div className={`h-2.5 rounded-full ${branch.score > 80 ? 'bg-green-500' : branch.score > 50 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${Math.min(branch.score, 100)}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{branch.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{branch.metrics.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{branch.metrics.members.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Rankings;
