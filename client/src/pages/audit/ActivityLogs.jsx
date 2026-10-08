import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useActivityLogs } from "../../hooks/useAudit";
import { 
  Activity, Clock, User, Zap, Database, Shield, FileCheck, 
  Radio, RefreshCw, Trash2, CheckCircle2, BookOpen, Key
} from "lucide-react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { getSocketUrl } from "../../services/runtimeConfig";
import toast from "react-hot-toast";

const MODULE_ICONS = {
  AUTH: <Key size={16} className="text-purple-500" />,
  BOOK: <BookOpen size={16} className="text-blue-500" />,
  BOOKS: <BookOpen size={16} className="text-blue-500" />,
  CIRCULATION: <Zap size={16} className="text-amber-500" />,
  MEMBER: <User size={16} className="text-emerald-500" />,
  SYSTEM: <Activity size={16} className="text-indigo-500" />
};

const ActivityLogs = () => {
  const { data, isLoading, refetch, isFetching } = useActivityLogs();
  const { user } = useSelector(state => state.auth);
  
  const [liveLogs, setLiveLogs] = useState([]);
  const [activeModule, setActiveModule] = useState("ALL");
  const [socketConnected, setSocketConnected] = useState(false);
  
  useEffect(() => {
    if (data?.data) {
      setLiveLogs(data.data);
    }
  }, [data]);
  
  useEffect(() => {
    // Connect to Socket.IO for real-time feed
    const socket = io(getSocketUrl());

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });
    
    if (user?.libraryId) {
      socket.on(`activity:${user.libraryId}`, (newLog) => {
        setLiveLogs(prev => [newLog, ...prev].slice(0, 150));
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const filteredLogs = liveLogs.filter(log => {
    if (activeModule === "ALL") return true;
    return (log.module || '').toUpperCase() === activeModule;
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Live Activity Stream</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Telemetry Feed
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time WebSocket event bus recording library interactions, checkouts, and system state.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{socketConnected ? "Socket Active" : "Polling Active"}</span>
          </div>

          <button
            onClick={() => {
              refetch();
              toast.success("Feed refreshed");
            }}
            disabled={isFetching}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh feed"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin text-blue-500" : ""} />
          </button>

          {liveLogs.length > 0 && (
            <button
              onClick={() => {
                setLiveLogs([]);
                toast.success("Feed buffer cleared");
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Clear Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* Nav Tabs for Audit Suite */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <Link
          to="/audit/logs"
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-2 shrink-0"
        >
          <Database size={15} />
          <span>Audit Trail</span>
        </Link>
        <Link
          to="/audit/activity"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 shrink-0"
        >
          <Activity size={15} />
          <span>Live Feed</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </Link>
        <Link
          to="/audit/security"
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-2 shrink-0"
        >
          <Shield size={15} />
          <span>Security Logs</span>
        </Link>
        <Link
          to="/audit/compliance"
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-2 shrink-0"
        >
          <FileCheck size={15} />
          <span>Compliance Report</span>
        </Link>
      </div>

      {/* Module Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold mr-1">Filter Module:</span>
        {["ALL", "AUTH", "CIRCULATION", "BOOK", "MEMBER", "SYSTEM"].map((mod) => (
          <button
            key={mod}
            onClick={() => setActiveModule(mod)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeModule === mod
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {mod}
          </button>
        ))}
        <span className="text-slate-400 text-xs ml-auto">
          {filteredLogs.length} events buffered
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 md:p-8 relative">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
              <span className="text-sm font-medium">Connecting to event stream...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-24 text-center">
            <Radio className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Activity Events</h3>
            <p className="text-xs text-slate-400 mt-1">Live events will appear automatically as patrons and staff perform actions.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/40 before:via-slate-300 dark:before:via-slate-800 before:to-transparent">
            {filteredLogs.map((log, index) => (
              <div key={log._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Center Node Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:scale-110 transition-transform">
                  {MODULE_ICONS[log.module] || <Zap size={16} className="text-blue-500" />}
                </div>
                
                {/* Timeline Card */}
                <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {log.action}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock size={11} /> {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {log.description}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {log.module}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ActivityLogs;
