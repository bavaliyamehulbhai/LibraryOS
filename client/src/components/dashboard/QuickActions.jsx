import React from "react";
import { Link } from "react-router-dom";
import { 
  BookPlus, UserPlus, Repeat, ArrowDownLeft, 
  Receipt, ShieldCheck, Sparkles, ChevronRight, Zap 
} from "lucide-react";

const QuickActions = () => {
  const actions = [
    { 
      title: "Catalog Book", 
      desc: "ISBN auto-enrichment",
      icon: BookPlus, 
      link: "/books/new", 
      color: "text-indigo-600 dark:text-indigo-400", 
      border: "border-indigo-500/20",
      bg: "bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40" 
    },
    { 
      title: "Register Patron", 
      desc: "Instant RFID badge enrollment",
      icon: UserPlus, 
      link: "/members/new", 
      color: "text-violet-600 dark:text-violet-400", 
      border: "border-violet-500/20",
      bg: "bg-violet-500/5 hover:bg-violet-500/10 dark:bg-violet-950/20 dark:hover:bg-violet-950/40" 
    },
    { 
      title: "Checkout Desk", 
      desc: "Fast barcode circulation",
      icon: Repeat, 
      link: "/issues/new", 
      color: "text-emerald-600 dark:text-emerald-400", 
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40" 
    },
    { 
      title: "Return & Check-in", 
      desc: "Automatic fine reconciler",
      icon: ArrowDownLeft, 
      link: "/returns", 
      color: "text-teal-600 dark:text-teal-400", 
      border: "border-teal-500/20",
      bg: "bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-950/20 dark:hover:bg-teal-950/40" 
    },
    { 
      title: "Invoices & Fees", 
      desc: "Institutional statements & PDF",
      icon: Receipt, 
      link: "/invoices", 
      color: "text-amber-600 dark:text-amber-400", 
      border: "border-amber-500/20",
      bg: "bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/20 dark:hover:bg-amber-950/40" 
    },
    { 
      title: "Audit & SIEM", 
      desc: "Immutable cryptographic ledger",
      icon: ShieldCheck, 
      link: "/audit/logs", 
      color: "text-rose-600 dark:text-rose-400", 
      border: "border-rose-500/20",
      bg: "bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-950/20 dark:hover:bg-rose-950/40" 
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Zap size={14} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-wide">
              Rapid Execution Desk
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              One-click access to high-velocity library circulation workflows
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
          Quick Launch
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link 
              key={idx} 
              to={action.link} 
              className={`group flex flex-col items-start p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${action.border} ${action.bg}`}
            >
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-sm mb-2.5 group-hover:scale-110 transition-transform">
                <Icon className={action.color} size={18} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 w-full justify-between">
                <span>{action.title}</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {action.desc}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
