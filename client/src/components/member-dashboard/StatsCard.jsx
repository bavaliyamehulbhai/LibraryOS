import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${colorMap[color]}`}>
        {icon}
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</span>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
    </div>
  );
};

export default StatsCard;
