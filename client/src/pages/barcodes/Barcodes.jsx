import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBarcodeStats } from "../../hooks/useBarcodes";
import { 
  Barcode, Printer, ScanLine, ArrowRight, 
  Sparkles, CheckCircle2, ShieldCheck, Zap 
} from "lucide-react";

const Barcodes = () => {
  const { data: statsData, isLoading } = useBarcodeStats();
  const [quickTestCode, setQuickTestCode] = useState("");
  const stats = statsData?.data || { totalBarcodes: 0, scansToday: 0 };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Hardware & Optical Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Barcode className="text-indigo-600 dark:text-indigo-400" size={28} />
            Barcode & RFID Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Generate printable Code-128 / QR label batches, calibrate optical scanners, and monitor circulation throughput.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/barcodes/print"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Printer size={16} />
            <span>Generate Labels</span>
          </Link>
        </div>
      </div>

      {/* Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Barcodes
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Barcode size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? "..." : stats.totalBarcodes || 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Unique Code-128 inventory tags</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scans Processed Today
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ScanLine size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {isLoading ? "..." : stats.scansToday || 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Optical scanner throughput</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Symbology Standard
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">CODE-128</div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">High-density alphanumeric support</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scanner Gun Listener
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>READY & LISTENING</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">USB & Bluetooth HID auto-detect</div>
        </div>

      </div>

      {/* Main Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Live Scanner Terminal */}
        <Link 
          to="/barcodes/scanner" 
          className="group glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <ScanLine size={28} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Live Optical Scanner Desk
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Connect external handheld USB/Bluetooth barcode guns or use device camera to instantly locate books, trigger checkouts, or audit shelf presence.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>Launch Scanner Terminal</span>
            <ArrowRight size={16} />
          </div>
        </Link>

        {/* Module 2: Print & Label Studio */}
        <Link 
          to="/barcodes/print" 
          className="group glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:border-violet-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
              <Printer size={28} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Print & Label Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                Avery Compatible
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Generate standardized sticker label sheets (Avery 5160, 30-per-sheet, or custom thermal roll formats) for physical copies with library logos and shelf codes.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
            <span>Open Label Generator</span>
            <ArrowRight size={16} />
          </div>
        </Link>

      </div>

    </div>
  );
};

export default Barcodes;
