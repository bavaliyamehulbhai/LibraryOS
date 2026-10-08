import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Activity, Clock, User, ArrowRight, 
  Sparkles, Radio, BookOpen, Repeat, ShieldCheck 
} from "lucide-react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { getSocketUrl } from "../../services/runtimeConfig";

const getActionBadge = (action = "") => {
  const upper = action.toUpperCase();
  if (upper.includes("ISSUE")) return { icon: "📖", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
  if (upper.includes("RETURN")) return { icon: "📥", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  if (upper.includes("MEMBER") || upper.includes("USER")) return { icon: "👤", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" };
  if (upper.includes("FINE") || upper.includes("PAYMENT")) return { icon: "💰", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  if (upper.includes("DELETE") || upper.includes("BLOCK")) return { icon: "⚠️", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
  return { icon: "⚡", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
};

const ActivityFeed = ({ initialFeed = [] }) => {
  const { user } = useSelector(state => state.auth);
  const [feed, setFeed] = useState(initialFeed);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setFeed(initialFeed);
  }, [initialFeed]);

  useEffect(() => {
    const socket = io(getSocketUrl());
    
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    if (user?.libraryId) {
      socket.on(`activity:${user.libraryId}`, (newLog) => {
        setFeed(prev => [newLog, ...prev].slice(0, 15));
      });
    }

    return () => socket.disconnect();
  }, [user]);

  return (
    <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden flex flex-col h-full shadow-sm">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
              Live Activity Radar
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Institutional event telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isConnected ? "LIVE STREAM" : "CONNECTED"}</span>
        </div>
      </div>

      {/* Feed List */}
      <div className="p-3 flex-1 overflow-y-auto max-h-[640px] space-y-2">
        {feed.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-slate-400">
            <Radio size={28} className="mx-auto text-indigo-400 animate-pulse" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Listening for events...
            </p>
            <p className="text-[11px] text-slate-400">
              Live circulation and operator actions will stream here.
            </p>
          </div>
        ) : (
          feed.map((log, idx) => {
            const badge = getActionBadge(log.action);
            const timeAgo = formatTimeAgo(log.createdAt);
            const operatorName = log.userId?.name || log.performedBy || "System Operator";
            
            return (
              <div 
                key={log._id || idx} 
                className="p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-100/60 dark:bg-slate-950/40 dark:hover:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80 transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {badge.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {log.description || "Operational mutation committed."}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                    <span>{operatorName}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span>Audited in Real-time</span>
        <Link 
          to="/audit/activity" 
          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>Activity Stream</span>
          <ArrowRight size={11} />
        </Link>
      </div>

    </div>
  );
};

export default ActivityFeed;
