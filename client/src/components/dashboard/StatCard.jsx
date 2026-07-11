import React from "react";

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, bgColorClass }) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300">
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        {subtitle && <p className={`text-xs mt-2 opacity-80 ${colorClass}`}>{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-4 rounded-full ${bgColorClass}`}>
          <Icon className={colorClass} size={28} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
