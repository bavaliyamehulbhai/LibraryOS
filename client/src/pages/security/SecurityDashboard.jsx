import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import securityService from "../../services/securityService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import { 
  ShieldCheck, ShieldAlert, AlertOctagon, Lock, Users, 
  Activity, Laptop, Clock, ArrowRight, RefreshCw, Key,
  Radio, CheckCircle2, Copy
} from "lucide-react";

const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState({ totalLogins: 0, failedLogins: 0, lockedUsers: 0, activeSessions: 0 });
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityData = async () => {
    try {
      const [metricsRes, alertsRes, activityRes, trendsRes] = await Promise.all([
        securityService.getSecurityMetrics(),
        securityService.getSecurityAlerts(),
        securityService.getLoginActivity(),
        securityService.getLoginTrends()
      ]);
      
      setMetrics(metricsRes.data || { totalLogins: 0, failedLogins: 0, lockedUsers: 0, activeSessions: 0 });
      setAlerts(alertsRes.data || []);
      setActivity(activityRes.data || []);
      setTrends(trendsRes.data || []);
    } catch {
      toast.error("Failed to fetch SIEM security telemetry");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const copyIp = (ip) => {
    navigator.clipboard.writeText(ip);
    toast.success(`Copied IP: ${ip}`);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium">Aggregating SIEM cyber intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Security & SIEM Center</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  v2.0 Titanium
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time threat monitoring, brute force mitigation, and authentication security telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WAF Armed</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh SIEM Telemetry"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-rose-500" : ""} />
          </button>

          <Link
            to="/audit/security"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
          >
            <span>Incident Logs</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Cyber Posture KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Logins</span>
            <Key size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalLogins}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Authenticated ingress events</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Failed Attempts</span>
            <AlertOctagon size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {metrics.failedLogins}
          </div>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">Rate-limited / rejected</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Locked Accounts</span>
            <Lock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {metrics.lockedUsers}
          </div>
          <p className="text-[11px] text-amber-500 mt-1 font-medium">Breach safeguard locked</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Sessions</span>
            <Users size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.activeSessions}
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium">Live valid JWT tokens</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trends Graph */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                <span>30-Day Ingress Velocity Trend</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Daily Traffic Pulse</span>
            </div>
            
            <div className="h-64">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                  Collecting time-series login trajectory...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: "1rem", 
                        backgroundColor: "#0f172a", 
                        border: "1px solid #1e293b", 
                        color: "#fff",
                        fontSize: "12px"
                      }} 
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Ingress Table */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop size={16} className="text-purple-500" />
                <span>Recent Authentication Events</span>
              </h3>
              <span className="text-xs text-slate-400">{activity.length} captured</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Client IP</th>
                    <th className="px-5 py-3.5">Device Agent</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans text-xs">
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400">
                        No recent login events recorded.
                      </td>
                    </tr>
                  ) : (
                    activity.map(act => (
                      <tr key={act._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {act.userId?.name || act.email || "Unknown User"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                          <button
                            onClick={() => copyIp(act.ipAddress || '127.0.0.1')}
                            className="hover:underline flex items-center gap-1 text-[11px]"
                            title="Click to copy IP"
                          >
                            <span>{act.ipAddress || '127.0.0.1'}</span>
                            <Copy size={11} className="opacity-50" />
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={act.system}>
                          {act.system || "Browser Client"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.status === 'SUCCESS' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {act.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-[11px] text-slate-400">
                          {new Date(act.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Alerts (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ShieldAlert size={16} className="text-rose-500" />
              <span>SIEM Automated Threat Alerts</span>
            </h3>

            {alerts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Zero Threat Triggers</h4>
                <p className="text-[11px] text-slate-400">Firewall rules and rate limiters report clean posture.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 dark:text-rose-300">{alert.type || "Suspicious Ingress"}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SecurityDashboard;
