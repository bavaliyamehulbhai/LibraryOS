import React from "react";
import { Link } from "react-router-dom";
import { 
  AlertCircle, ShieldAlert, ShieldCheck, 
  ArrowRight, Sparkles, ExternalLink 
} from "lucide-react";

const AlertsWidget = ({ lowStock = [], securityAlerts = [] }) => {
  const totalAlerts = lowStock.length + securityAlerts.length;

  return (
    <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden flex flex-col h-full shadow-sm">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle size={16} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
              Operational Sentinels
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Low inventory & security triggers
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
          totalAlerts > 0
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        }`}>
          {totalAlerts} {totalAlerts === 1 ? 'Notice' : 'Notices'}
        </span>
      </div>

      {/* Body List */}
      <div className="p-3 flex-1 overflow-y-auto max-h-[300px] space-y-2">
        {totalAlerts === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Zero Active Incidents
            </p>
            <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
              Inventory thresholds & SIEM policies are operating within standard parameters.
            </p>
          </div>
        ) : (
          <>
            {/* Security Alerts */}
            {securityAlerts.map((alert, idx) => (
              <div 
                key={`sec-${idx}`} 
                className="p-3 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 border border-rose-500/20 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {alert.event || 'Security Anomaly'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-600 text-white uppercase">
                        {alert.severity || 'HIGH'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {alert.details || 'Elevated privileges or unauthorized ingress pattern.'}
                    </p>
                  </div>
                </div>
                <Link 
                  to="/security" 
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0 p-1"
                  title="Inspect Incident"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}

            {/* Low Stock Alerts */}
            {lowStock.map((item, idx) => (
              <div 
                key={`stk-${idx}`} 
                className="p-3 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 border border-amber-500/20 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-400 uppercase">
                        {item.available} Left
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Stock depleted below safety threshold.
                    </p>
                  </div>
                </div>
                <Link 
                  to="/procurement/requests" 
                  className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 shrink-0 p-1"
                  title="Create Requisition"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer Link */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span>Sentinel Engine Active</span>
        <Link to="/audit/security" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
          <span>Security Ledger</span>
          <ArrowRight size={11} />
        </Link>
      </div>

    </div>
  );
};

export default AlertsWidget;
