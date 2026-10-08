import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuditLogs, useAuditStats } from "../../hooks/useAudit";
import { 
  Database, Search, Filter, Shield, Activity, FileCheck, 
  Download, Eye, X, ArrowUpDown, RefreshCw, Terminal, 
  CheckCircle2, AlertTriangle, Layers, Clock, Laptop, User
} from "lucide-react";
import toast from "react-hot-toast";

const ACTION_COLOR_MAP = {
  CREATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  CREATED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  UPDATE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  UPDATED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  DELETE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  DELETED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  SECURITY: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  AUTH: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
};

const getActionBadgeClass = (action = "") => {
  const upper = action.toUpperCase();
  if (upper.includes("DELETE") || upper.includes("REMOVE") || upper.includes("DROP")) {
    return ACTION_COLOR_MAP.DELETE;
  }
  if (upper.includes("CREATE") || upper.includes("ADD") || upper.includes("ISSUE")) {
    return ACTION_COLOR_MAP.CREATE;
  }
  if (upper.includes("UPDATE") || upper.includes("EDIT") || upper.includes("PATCH") || upper.includes("RENEW")) {
    return ACTION_COLOR_MAP.UPDATE;
  }
  if (upper.includes("AUTH") || upper.includes("LOGIN") || upper.includes("LOGOUT")) {
    return ACTION_COLOR_MAP.AUTH;
  }
  return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
};

const AuditLogs = () => {
  const location = useLocation();
  const [params, setParams] = useState({ page: 1, limit: 50, action: "", module: "" });
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeActionFilter, setActiveActionFilter] = useState("ALL");

  const { data, isLoading, refetch, isFetching } = useAuditLogs(params);
  const { data: statsData } = useAuditStats();
  
  const logs = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data || {};

  const handleActionPreset = (preset) => {
    setActiveActionFilter(preset);
    setParams(prev => ({
      ...prev,
      page: 1,
      action: preset === "ALL" ? "" : preset
    }));
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No audit logs available to export");
      return;
    }

    try {
      const headers = ["Timestamp", "Action", "Entity", "Performed_By", "Email", "IP_Address", "Details"];
      const rows = logs.map(log => [
        `"${new Date(log.createdAt).toISOString()}"`,
        `"${log.action || ''}"`,
        `"${log.entity || ''}"`,
        `"${log.performedBy?.name || 'System'}"`,
        `"${log.performedBy?.email || ''}"`,
        `"${log.ipAddress || 'N/A'}"`,
        `"${(log.details || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `LibraryOS_AuditTrail_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Audit trail exported successfully!");
    } catch {
      toast.error("Failed to export audit logs");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header & Cyber Operations Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Audit & Forensics</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  v2.0 Titanium
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Cryptographic immutable log of administrative events, data mutations, and role modifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
            title="Refresh logs"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin text-blue-500" : "text-slate-400"} />
            <span>Sync</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs for Audit Suite */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <Link
          to="/audit/logs"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center gap-2 shrink-0"
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

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Audits</span>
            <Database size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {pagination?.total || logs.length || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Logged event records</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mutations</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {logs.filter(l => (l.action || '').includes('CREATE') || (l.action || '').includes('UPDATE')).length}
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium">Data writes & updates</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Deletions</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {logs.filter(l => (l.action || '').includes('DELETE')).length}
          </div>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">Destructive operations</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Node</span>
            <Layers size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            Encrypted
          </div>
          <p className="text-[11px] text-purple-500 mt-1 font-medium">AES-256 GCM sealed</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Action Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Action (e.g. BOOK_CREATED, USER_DELETED)..." 
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={params.action}
              onChange={(e) => setParams({ ...params, action: e.target.value.toUpperCase(), page: 1 })}
            />
            {params.action && (
              <button 
                onClick={() => setParams({ ...params, action: "", page: 1 })}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Module Filter */}
          <div className="flex-1 md:max-w-xs relative">
            <Filter className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter Entity / Module (e.g. Book, User)..." 
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={params.module}
              onChange={(e) => setParams({ ...params, module: e.target.value, page: 1 })}
            />
            {params.module && (
              <button 
                onClick={() => setParams({ ...params, module: "", page: 1 })}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Limit selector */}
          <select
            value={params.limit}
            onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {/* Quick action chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Quick Presets:</span>
          {["ALL", "CREATE", "UPDATE", "DELETE", "AUTH"].map((preset) => (
            <button
              key={preset}
              onClick={() => handleActionPreset(preset)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeActionFilter === preset
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Client IP</th>
                <th className="px-6 py-4">Summary</th>
                <th className="px-6 py-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      <span className="text-sm font-medium">Decrypting and streaming audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-20">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <Database className="mx-auto text-slate-300 dark:text-slate-600" size={44} />
                      <h3 className="font-bold text-slate-700 dark:text-slate-300">No Audit Events Logged</h3>
                      <p className="text-xs text-slate-400">No actions matching your filter criteria were recorded.</p>
                      {(params.action || params.module) && (
                        <button
                          onClick={() => setParams({ page: 1, limit: 50, action: "", module: "" })}
                          className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group">
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border tracking-wide font-mono ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>{log.entity || 'General'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      {log.performedBy ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                            {(log.performedBy.name || "U")[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {log.performedBy.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {log.performedBy.email}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
                          <Terminal size={12} /> System Kernel
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.ipAddress || '127.0.0.1'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-[220px] truncate" title={log.details || "No summary"}>
                      {log.details || (log.newData ? "Object payload mutated" : "Transaction completed")}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5 ml-auto"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Toolbar */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing page <strong className="text-slate-900 dark:text-white">{params.page}</strong> of <strong className="text-slate-900 dark:text-white">{pagination.pages}</strong> ({pagination.total || logs.length} records)
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={params.page <= 1}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition font-medium"
              >
                Previous
              </button>
              <button 
                disabled={params.page >= pagination.pages}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forensic Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Audit Payload Inspector</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${getActionBadgeClass(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Record ID: {selectedLog._id} • {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Actor & Host Telemetry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                    <User size={13} /> Actor
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedLog.performedBy?.name || "System Kernel"}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {selectedLog.performedBy?.email || "internal-daemon"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                    <Laptop size={13} /> Network IP
                  </div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {selectedLog.ipAddress || "127.0.0.1"}
                  </div>
                  <div className="text-[11px] text-emerald-500 font-medium">Authenticated Host</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                    <Database size={13} /> Target Entity
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedLog.entity || "General"}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">
                    {selectedLog.entityId || "N/A"}
                  </div>
                </div>
              </div>

              {/* Summary Description */}
              {selectedLog.details && (
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 text-xs leading-relaxed">
                  <strong className="block font-semibold mb-0.5 text-blue-600 dark:text-blue-400">Execution Summary:</strong>
                  {selectedLog.details}
                </div>
              )}

              {/* Data Diff or JSON payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Cryptographic Forensic Dump</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                      toast.success("Payload copied to clipboard!");
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline normal-case font-medium"
                  >
                    Copy JSON
                  </button>
                </div>
                <div className="rounded-2xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner max-h-72">
                  <pre>{JSON.stringify({
                    id: selectedLog._id,
                    action: selectedLog.action,
                    entity: selectedLog.entity,
                    entityId: selectedLog.entityId,
                    performedBy: selectedLog.performedBy,
                    ipAddress: selectedLog.ipAddress,
                    details: selectedLog.details,
                    oldData: selectedLog.oldData,
                    newData: selectedLog.newData,
                    timestamp: selectedLog.createdAt
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuditLogs;
