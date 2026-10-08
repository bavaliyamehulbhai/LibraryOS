import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSecurityLogs } from "../../hooks/useAudit";
import { 
  ShieldAlert, Shield, ShieldCheck, AlertOctagon, Database, 
  Activity, FileCheck, Search, Filter, Download, X, Copy, 
  ExternalLink, CheckCircle2, User, Laptop, Clock
} from "lucide-react";
import toast from "react-hot-toast";

const SEVERITY_CONFIG = {
  CRITICAL: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    dot: "bg-rose-500",
    icon: <AlertOctagon size={14} className="text-rose-500 animate-pulse" />
  },
  HIGH: {
    badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    dot: "bg-orange-500",
    icon: <ShieldAlert size={14} className="text-orange-500" />
  },
  MEDIUM: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
    icon: <Shield size={14} className="text-amber-500" />
  },
  LOW: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    dot: "bg-blue-500",
    icon: <ShieldCheck size={14} className="text-blue-500" />
  }
};

const SecurityLogs = () => {
  const { data, isLoading, refetch, isFetching } = useSecurityLogs();
  const logs = data?.data || [];

  const [search, setSearch] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [activeLog, setActiveLog] = useState(null);

  const filteredLogs = logs.filter(log => {
    const matchesSeverity = selectedSeverity === "ALL" || (log.severity || '').toUpperCase() === selectedSeverity;
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      (log.event || '').toLowerCase().includes(searchLower) ||
      (log.details || '').toLowerCase().includes(searchLower) ||
      (log.ipAddress || '').toLowerCase().includes(searchLower) ||
      (log.userId?.email || '').toLowerCase().includes(searchLower);
    return matchesSeverity && matchesSearch;
  });

  const criticalCount = logs.filter(l => l.severity === "CRITICAL").length;
  const highCount = logs.filter(l => l.severity === "HIGH").length;
  const mediumCount = logs.filter(l => l.severity === "MEDIUM").length;

  const exportSecurityCSV = () => {
    if (logs.length === 0) {
      toast.error("No security logs to export");
      return;
    }

    try {
      const headers = ["Timestamp", "Severity", "Event", "User_Name", "User_Email", "IP_Address", "Details"];
      const rows = logs.map(l => [
        `"${new Date(l.createdAt).toISOString()}"`,
        `"${l.severity || ''}"`,
        `"${l.event || ''}"`,
        `"${l.userId?.name || 'Unknown'}"`,
        `"${l.userId?.email || ''}"`,
        `"${l.ipAddress || 'N/A'}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `LibraryOS_SecurityAudit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Security log exported!");
    } catch {
      toast.error("Failed to export security logs");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Security Incident Logs</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  SIEM Guard
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time security intelligence monitoring brute force logins, privilege escalations, and auth anomalies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportSecurityCSV}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Download size={15} />
            <span>Export Incident Log</span>
          </button>
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
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-2 shrink-0"
        >
          <Activity size={15} />
          <span>Live Feed</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </Link>
        <Link
          to="/audit/security"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 shrink-0"
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

      {/* Security Threat KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Threats</span>
            <AlertOctagon size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {criticalCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires immediate review</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">High Severity</span>
            <ShieldAlert size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
            {highCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Elevated risk events</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Medium / Warnings</span>
            <Shield size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {mediumCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Minor policy violations</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">WAF Health</span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            Armed
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium">Rate-limit active</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by event, IP address, user email, details..." 
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSeverity === sev
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security Incident Table */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Security Event</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Target User</th>
                <th className="px-6 py-4">Client IP</th>
                <th className="px-6 py-4">Forensic Summary</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></div>
                      <span className="text-sm font-medium">Scanning security threat matrix...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-20">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <ShieldCheck className="mx-auto text-emerald-500" size={48} />
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">Zero Security Anomalies</h3>
                      <p className="text-xs text-slate-400">No security incidents detected matching the current criteria.</p>
                      {search && (
                        <button
                          onClick={() => { setSearch(""); setSelectedSeverity("ALL"); }}
                          className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const sevConf = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.LOW;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group">
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border tracking-wide font-mono flex items-center gap-1.5 w-max ${sevConf.badge}`}>
                          {sevConf.icon}
                          <span>{log.severity}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                        {log.event}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        {log.userId ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {log.userId.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.userId.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Anonymous / Unauthenticated</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {log.ipAddress || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-[240px] truncate" title={log.details}>
                        {log.details || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setActiveLog(log)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Review Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Incident Forensic Card
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {activeLog._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <div>
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Event Type</span>
                  <div className="text-base font-extrabold text-rose-900 dark:text-rose-200">{activeLog.event}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border font-mono ${SEVERITY_CONFIG[activeLog.severity]?.badge}`}>
                  {activeLog.severity}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details & Trigger</label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeLog.details || "No technical description logged for this event."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Origin IP</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeLog.ipAddress || '127.0.0.1'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Timestamp</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{new Date(activeLog.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {activeLog.userId && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Target Account</span>
                  <div className="font-bold text-slate-900 dark:text-white">{activeLog.userId.name}</div>
                  <div className="text-slate-400 font-mono">{activeLog.userId.email}</div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end gap-2">
              <button
                onClick={() => {
                  toast.success("Incident marked as acknowledged by admin");
                  setActiveLog(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Acknowledge Incident</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SecurityLogs;
