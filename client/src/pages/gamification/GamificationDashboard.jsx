import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GamificationDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const XP_PER_LEVEL = 500;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, leaderboardRes] = await Promise.all([
        api.get('/v1/gamification/profile'),
        api.get('/v1/gamification/leaderboard')
      ]);
      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.data);
    } catch (error) {
      toast.error("Failed to load gamification data");
    } finally {
      setLoading(false);
    }
  };

  const simulateAction = async (amount) => {
    try {
      const res = await api.post('/v1/gamification/simulate', { amount });
      if (res.data.success) {
        toast.success(`Earned ${amount} XP!`);
        if (res.data.data.levelUp) {
           toast.success(`🎉 LEVEL UP! You are now level ${res.data.data.profile.level}`);
        }
        setProfile(res.data.data.profile);
        
        // Refresh leaderboard quietly
        const leadRes = await api.get('/v1/gamification/leaderboard');
        if (leadRes.data.success) setLeaderboard(leadRes.data.data);
      }
    } catch (error) {
      toast.error("Failed to simulate action");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  if (!profile) return null;

  const currentLevelXp = profile.xp % XP_PER_LEVEL;
  const progressPercent = (currentLevelXp / XP_PER_LEVEL) * 100;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-8 rounded-3xl shadow-xl border border-indigo-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 text-9xl">🏆</div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 flex items-center justify-center text-4xl shadow-inner">
                 <span className="font-black text-white">{profile.level}</span>
              </div>
              <div>
                 <h1 className="text-3xl font-black mb-1">Level {profile.level} Reader</h1>
                 <p className="text-indigo-200">Keep reading to unlock new levels and badges!</p>
                 <div className="mt-4 flex items-center gap-4">
                    <span className="bg-white/10 px-4 py-2 rounded-full font-bold text-sm">🔥 {profile.currentStreak} Day Streak</span>
                    <span className="bg-white/10 px-4 py-2 rounded-full font-bold text-sm">✨ {profile.xp} Total XP</span>
                 </div>
              </div>
           </div>

           <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-sm font-bold text-indigo-200">
                 <span>{currentLevelXp} XP</span>
                 <span>{XP_PER_LEVEL} XP</span>
              </div>
              <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/10">
                 <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                 ></div>
              </div>
              <p className="text-xs text-center text-indigo-300 font-medium pt-1">
                 {XP_PER_LEVEL - currentLevelXp} XP to Level {profile.level + 1}
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Badges & Actions */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Demo Action Simulator */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-orange-200 dark:border-orange-900/50">
               <h2 className="text-sm font-black uppercase text-orange-600 dark:text-orange-400 mb-4 tracking-wider flex items-center gap-2">
                  <span>⚡</span> Action Simulator (Demo Mode)
               </h2>
               <div className="flex flex-wrap gap-4">
                  <button onClick={() => simulateAction(50)} className="px-4 py-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-200 transition-colors">
                     📖 Finish Book (+50 XP)
                  </button>
                  <button onClick={() => simulateAction(10)} className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 transition-colors">
                     📝 Complete Quiz (+10 XP)
                  </button>
                  <button onClick={() => simulateAction(100)} className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold rounded-xl hover:bg-green-200 transition-colors">
                     🏆 Complete Challenge (+100 XP)
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Your Badges</h2>
               {profile.badges.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                     <p className="text-gray-500 font-bold">No badges earned yet. Start reading!</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {profile.badges.map((badge, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                           <div className="text-5xl mb-3">{badge.icon}</div>
                           <h3 className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</h3>
                           <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                        </div>
                     ))}
                  </div>
               )}
            </div>

         </div>

         {/* Leaderboard */}
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center justify-between">
               Leaderboard
               <span className="text-sm font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-3 py-1 rounded-full">Top 10</span>
            </h2>
            
            <div className="space-y-4">
               {leaderboard.map((entry, index) => (
                  <div key={entry._id} className={`flex items-center justify-between p-4 rounded-2xl border ${index === 0 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30' : index === 1 ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' : index === 2 ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                     <div className="flex items-center gap-4">
                        <div className="font-black text-xl w-6 text-center text-gray-400">
                           {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div>
                           <p className={`font-bold ${index < 3 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {entry.userId?.name || 'Unknown User'}
                           </p>
                           <p className="text-xs text-gray-500 font-medium">Lvl {entry.level} • {entry.currentStreak} day streak</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`font-black ${index === 0 ? 'text-yellow-600 dark:text-yellow-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                           {entry.xp} XP
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
};

export default GamificationDashboard;
