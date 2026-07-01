import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReaderLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/v1/reading-analytics/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">🏆 Reader Leaderboard</h1>
        <p className="text-xl text-gray-500">Celebrating our most dedicated and consistent readers.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="p-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Rank</th>
                  <th className="p-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Reader</th>
                  <th className="p-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Total Hours</th>
                  <th className="p-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Books Read</th>
                  <th className="p-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Current Streak</th>
               </tr>
            </thead>
            <tbody>
               {leaderboard.length > 0 ? leaderboard.map((profile, index) => (
                  <tr key={profile._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                     <td className="p-6">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg
                           ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                             index === 1 ? 'bg-gray-200 text-gray-700' :
                             index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 dark:bg-gray-700 text-gray-500'}`}
                        >
                           #{index + 1}
                        </div>
                     </td>
                     <td className="p-6 font-bold text-gray-900 dark:text-white">
                        {profile.userId?.firstName} {profile.userId?.lastName}
                        <div className="text-xs font-normal text-gray-500">{profile.userId?.email}</div>
                     </td>
                     <td className="p-6 font-extrabold text-indigo-600 dark:text-indigo-400 text-xl">
                        {Math.floor(profile.totalHoursRead)} <span className="text-sm font-medium text-gray-500">hrs</span>
                     </td>
                     <td className="p-6 font-bold text-gray-700 dark:text-gray-300">
                        {profile.totalBooksRead}
                     </td>
                     <td className="p-6 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        🔥 {profile.currentStreak} Days
                     </td>
                  </tr>
               )) : (
                  <tr>
                     <td colSpan="5" className="p-12 text-center text-gray-500">No readers on the board yet.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

    </div>
  );
};

export default ReaderLeaderboard;
