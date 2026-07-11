import React from "react";

const ChartCard = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6 flex flex-col h-full hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300">
      <div className="flex items-center gap-2 mb-6">
        {Icon && <Icon className="text-gray-500" />}
        <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{title}</h2>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
