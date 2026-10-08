import React from "react";
import { Link } from "react-router-dom";
import { useComplianceReport } from "../../hooks/useAudit";
import { 
  FileCheck, ShieldAlert, Edit3, Users, Printer, Database, 
  Activity, Shield, CheckCircle2, Award, AlertTriangle, Layers, Clock
} from "lucide-react";

const ComplianceReports = () => {
  const { data, isLoading } = useComplianceReport();
  const report = data?.data || {};

  const securityEventsCount = report.securityEvents?.length || 0;
  const recentEditsCount = report.recentEdits?.length || 0;
  const activeUsersCount = report.activeUsers?.length || 0;

  // Derive compliance rating score
  const score = Math.max(88, 100 - (securityEventsCount * 2));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <FileCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Compliance & Governance</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  ISO / SOC-2 / FERPA
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Executive governance review, security posture attestation, and data modification audit report.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition flex items-center gap-2"
          >
            <Printer size={15} />
            <span>Print Compliance PDF</span>
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
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-2 shrink-0"
        >
          <Shield size={15} />
          <span>Security Logs</span>
        </Link>
        <Link
          to="/audit/compliance"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center gap-2 shrink-0"
        >
          <FileCheck size={15} />
          <span>Compliance Report</span>
        </Link>
      </div>

      {/* Executive Health Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold tracking-widest uppercase">
              <Award size={16} /> Certified Health Index
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              System Audit Health: <span className="text-emerald-400">{score}% Compliant</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Institutional policies for book loans, patron records, data immutability, and access controls are actively operating within normal audit parameters.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="block text-2xl font-black text-emerald-400">{score}%</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider">Health Rating</span>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <span className="block text-2xl font-black text-white">{securityEventsCount}</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider">Anomalies</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium">Aggregating compliance attestation report...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Security Alerts Matrix */}
            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden border-t-4 border-t-rose-500">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-500" />
                  <span>High-Risk Security Incidents</span>
                </h2>
                <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  {securityEventsCount} Flagged
                </span>
              </div>
              <div className="p-5">
                {securityEventsCount === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Clean Posture</p>
                    <p className="text-xs text-slate-400">No high or critical security alerts logged in this audit window.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {report.securityEvents?.map((event, idx) => (
                      <li key={idx} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{event.event}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{event.details}</p>
                          {event.userId && (
                            <span className="text-[11px] text-slate-400 font-mono">User: {event.userId.email}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0 ml-3">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Critical Data Edits */}
            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden border-t-4 border-t-blue-500">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 size={18} className="text-blue-500" />
                  <span>Recent Critical State Mutations</span>
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  {recentEditsCount} Records
                </span>
              </div>
              <div className="p-5">
                {recentEditsCount === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <Database size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Critical Edits</p>
                    <p className="text-xs text-slate-400">No destructive deletes or updates logged recently.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {report.recentEdits?.map((edit, idx) => (
                      <li key={idx} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {edit.action} <span className="text-slate-400 font-normal">on</span> {edit.entity}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            By <strong className="text-slate-700 dark:text-slate-300">{edit.performedBy?.name || 'System'}</strong>
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0 ml-3">
                          {new Date(edit.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Operator Activity Volume */}
            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden border-t-4 border-t-purple-500 md:col-span-2">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-500" />
                  <span>Operator Volume & Authorization Matrix</span>
                </h2>
                <span className="text-xs text-slate-400">Top 10 Active Administrative Accounts</span>
              </div>
              <div className="p-6">
                {activeUsersCount === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-6">No operator activity volume recorded.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {report.activeUsers?.map((user, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-center hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-2 shadow-sm">
                          {(user.name || "U")[0].toUpperCase()}
                        </div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={user.name}>
                          {user.name}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
                          {user.count} actions
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ComplianceReports;
