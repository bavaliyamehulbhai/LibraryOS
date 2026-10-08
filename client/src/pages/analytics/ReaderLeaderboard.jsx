import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Trophy, Flame, BookOpen, Clock, Medal, Crown, 
  Sparkles, Award, ArrowUpRight, User 
} from 'lucide-react';

const ReaderLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/reading-analytics/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const restLeaderboard = leaderboard.slice(3);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Reader Hall of Fame
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                Gamified Reading
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Celebrating top patrons, consistent study streaks, and literary milestones
            </p>
          </div>
        </div>

        {/* Timeframe Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto">
          {[
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All-Time Champions' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === t.id
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-amber-500/20 border-t-amber-500 mb-3"></div>
          <p className="text-xs text-slate-400">Calculating reading metrics...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Leaderboard Season Initializing
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Patron reading sessions are being compiled. Read e-books or check out physical books to claim the top podium!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {topThree.map((profile, idx) => {
                const rank = idx + 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                const borderColor = isFirst 
                  ? 'border-amber-400/60 dark:border-amber-400/40 shadow-amber-500/10' 
                  : isSecond 
                    ? 'border-slate-300 dark:border-slate-600' 
                    : 'border-amber-600/40 dark:border-amber-700/40';

                const badgeBg = isFirst 
                  ? 'bg-amber-400 text-slate-950' 
                  : isSecond 
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' 
                    : 'bg-amber-700/80 text-white';

                return (
                  <div 
                    key={profile._id}
                    className={`glass-card rounded-2xl border ${borderColor} bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-md relative overflow-hidden flex flex-col items-center text-center transition-all hover:-translate-y-1`}
                  >
                    {isFirst && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
                    )}

                    {/* Rank Badge */}
                    <div className="mb-4 relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${
                        isFirst ? 'from-amber-400 to-yellow-500 text-slate-950' :
                        isSecond ? 'from-slate-200 to-slate-400 text-slate-900' :
                        'from-amber-600 to-orange-700 text-white'
                      } flex items-center justify-center font-black text-2xl shadow-lg`}>
                        {isFirst ? <Crown className="w-8 h-8" /> : rank}
                      </div>
                      <span className={`absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeBg} shadow-sm uppercase tracking-wider`}>
                        {isFirst ? 'Gold #1' : isSecond ? 'Silver #2' : 'Bronze #3'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {profile.userId?.firstName} {profile.userId?.lastName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[200px] mb-4">
                      {profile.userId?.email}
                    </p>

                    <div className="w-full grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 block font-semibold">Hours Read</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{Math.floor(profile.totalHoursRead || 0)}h</span>
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 block font-semibold">Streak</span>
                        <span className="text-lg font-black text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{profile.currentStreak || 0}d</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table for remaining ranks */}
          {restLeaderboard.length > 0 && (
            <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 font-bold text-xs uppercase tracking-wider text-slate-500">
                Honor Roll (Ranks 4+)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Rank</th>
                      <th className="px-5 py-3.5">Patron Member</th>
                      <th className="px-4 py-3.5">Total Hours Read</th>
                      <th className="px-4 py-3.5">Books Completed</th>
                      <th className="px-4 py-3.5">Current Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {restLeaderboard.map((profile, index) => {
                      const actualRank = index + 4;
                      return (
                        <tr key={profile._id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                              #{actualRank}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {profile.userId?.firstName} {profile.userId?.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400">{profile.userId?.email}</div>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                            {Math.floor(profile.totalHoursRead || 0)} hrs
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                            {profile.totalBooksRead || 0} books
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold">
                              <Flame className="w-3.5 h-3.5" />
                              <span>{profile.currentStreak || 0} Days</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReaderLeaderboard;
