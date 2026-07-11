import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-500/20' },
    red: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-500/20' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-black/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${colors.bg.split(' ')[0]}`}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} border ${colors.border} text-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h2>
        <p className="text-[11px] font-black text-gray-400 mt-2 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
};

export default StatsCard;
