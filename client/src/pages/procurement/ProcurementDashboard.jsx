import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Building2, IndianRupee, TrendingUp, ShoppingBag, 
  CheckCircle2, Clock, FileCheck, ArrowRight, Sparkles 
} from 'lucide-react';

const ProcurementDashboard = () => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/procurement/budget');
      if (res.data.success) {
        setBudget(res.data.data);
      }
    } catch (error) {
      console.error('Procurement budget load error', error);
    } finally {
      setLoading(false);
    }
  };

  const allocated = budget?.allocatedBudget || 1000000;
  const utilized = budget?.utilizedBudget || 320000;
  const remaining = budget?.remainingBudget || (allocated - utilized);
  const percentUtilized = Math.min(100, Math.round((utilized / allocated) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Capital Assets & Procurement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="text-indigo-600 dark:text-indigo-400" size={28} />
            Institutional Procurement Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor fiscal allocation budgets, process multi-level PO approvals, and receive vendor inventory shipments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/procurement/requests"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <span>Purchase Requests</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Fiscal Budget KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Allocated Budget */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Allocated Budget (FY {budget?.fiscalYear || new Date().getFullYear()})
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            ₹{allocated.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total fiscal allocation approved by board
          </div>
        </div>

        {/* Utilized Budget */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Committed & Disbursed
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400">
            ₹{utilized.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Disbursed across purchase orders & subscriptions
          </div>
        </div>

        {/* Remaining Budget with Dynamic Progress Bar */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10 dark:from-emerald-950/30 dark:to-slate-900/80 backdrop-blur-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Remaining Treasury Liquidity
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            ₹{remaining.toLocaleString()}
          </div>
          <div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${percentUtilized}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
              <span>{percentUtilized}% budget consumed</span>
              <span>{(100 - percentUtilized)}% liquidity available</span>
            </div>
          </div>
        </div>

      </div>

      {/* Procurement Workflow Hub */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" />
            Procurement Operations Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select a pipeline stage to process requisitions, approve quotes, or inspect received consignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <Link 
            to="/procurement/requests"
            className="group p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 hover:bg-white dark:bg-slate-950/30 dark:hover:bg-slate-900/60 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Purchase Requests (PR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Staff submissions for new book editions, institutional journals, and physical equipment requisitions.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>View Requisitions</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link 
            to="/procurement/approvals"
            className="group p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 hover:bg-white dark:bg-slate-950/30 dark:hover:bg-slate-900/60 hover:border-violet-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pending PO Approvals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Administrative sign-off queue for purchase orders exceeding standard department thresholds.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
              <span>Review Queue</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link 
            to="/procurement/grn"
            className="group p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 hover:bg-white dark:bg-slate-950/30 dark:hover:bg-slate-900/60 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Goods Receipt Notes (GRN)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Physically inspect, barcode tag, and accept vendor book shipments into active catalog circulation.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Inspect Shipments</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
};

export default ProcurementDashboard;
