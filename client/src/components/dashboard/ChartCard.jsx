import React from "react";

const ChartCard = ({ title, subtitle, icon: Icon, action, children }) => {
  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col h-full border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Icon size={16} />
            </div>
          )}
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Chart Body */}
      <div className="flex-1 w-full min-h-[260px] relative">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
