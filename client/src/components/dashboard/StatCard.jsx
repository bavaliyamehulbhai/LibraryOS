import React from "react";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass = "text-indigo-600 dark:text-indigo-400", 
  bgColorClass = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  trend,
  trendDirection = "up",
  progressPercent
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:shadow-lg dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300">
      
      {/* Ambient gradient aura */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      {/* Top Row: Title + Icon */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>
        {Icon && (
          <div className={`p-2 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${bgColorClass}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Metric Value + Trend Indicator */}
      <div className="relative z-10">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
              trendDirection === 'up' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}>
              {trendDirection === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend}
            </span>
          )}
        </div>

        {/* Subtitle / Context Note */}
        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
            {subtitle}
          </p>
        )}

        {/* Optional Micro Progress Bar */}
        {typeof progressPercent === 'number' && (
          <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
