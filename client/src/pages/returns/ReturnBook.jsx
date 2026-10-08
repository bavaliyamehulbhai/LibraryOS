import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowDownLeft, Barcode, CheckCircle2, AlertTriangle, 
  HelpCircle, ShieldCheck, History, ArrowRight, Camera 
} from 'lucide-react';

const ReturnBook = () => {
  const navigate = useNavigate();
  const [copyBarcode, setCopyBarcode] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [returnLoading, setReturnLoading] = useState(false);

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!copyBarcode.trim()) {
      toast.error("Please scan or enter a book copy barcode.");
      return;
    }
    
    setReturnLoading(true);
    try {
      const res = await api.post('/v1/returns', {
        copyBarcode: copyBarcode.trim(),
        condition
      });
      
      if (res.data.success) {
        toast.success("Book returned and checked-in successfully!");
        setCopyBarcode('');
        setCondition('GOOD');
        navigate(`/returns/${res.data.data._id}`); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process book return');
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Return & Check-in Desk
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                Rapid Check-in
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Scan returned copy barcode to automatically calculate overdue fines and reconcile shelf stock
            </p>
          </div>
        </div>

        <Link 
          to="/returns" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 transition shadow-sm self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-emerald-500" />
          <span>Return History</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleReturn} className="space-y-6">
          
          {/* Step 1: Scan Barcode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Step 1: Scan Book Copy Barcode
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Scanner Listener Active</span>
              </div>
            </div>

            <div className="relative">
              <Barcode className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Scan with barcode gun or type copy barcode..." 
                value={copyBarcode}
                onChange={(e) => setCopyBarcode(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-base border border-slate-200/80 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono tracking-wider shadow-inner transition-all"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              System will instantly link the physical copy to the borrower and calculate any late days.
            </p>
          </div>

          {/* Step 2: Physical Condition Assessment */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Step 2: Physical Copy Condition
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setCondition('GOOD')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  condition === 'GOOD'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className={`w-5 h-5 ${condition === 'GOOD' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  {condition === 'GOOD' && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Selected</span>}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                  Good Condition
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pages intact, standard return with normal overdue rules
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCondition('DAMAGED')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  condition === 'DAMAGED'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className={`w-5 h-5 ${condition === 'DAMAGED' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                  {condition === 'DAMAGED' && <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Selected</span>}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                  Damaged Copy
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  Applies ₹200 repair assessment fee
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCondition('LOST')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  condition === 'LOST'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <HelpCircle className={`w-5 h-5 ${condition === 'LOST' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                  {condition === 'LOST' && <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Selected</span>}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                  Lost / Destroyed
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                  Applies Book Price + ₹100 penalty
                </p>
              </button>

            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Instant digital receipt generated on submission</span>
            </div>

            <button 
              type="submit" 
              disabled={returnLoading || !copyBarcode.trim()}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              {returnLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>Checking in...</span>
                </>
              ) : (
                <>
                  <span>Complete Return</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ReturnBook;
