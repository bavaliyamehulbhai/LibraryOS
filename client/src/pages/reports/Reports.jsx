import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
  FileText, Download, TrendingUp, DollarSign, BookOpen, 
  Users, Calendar, CheckCircle2, Clock, ShieldCheck, 
  ArrowUpRight, HardDrive, BarChart3
} from 'lucide-react';

const REPORT_CATEGORIES = [
  {
    id: 'financial',
    title: 'Financial & Revenue Ledger',
    icon: DollarSign,
    iconColor: 'from-emerald-500 to-teal-600',
    description: 'Transaction revenue breakdown, collected fines, pending overdue penalties, and membership billing.',
    formats: [
      { ext: 'csv', label: 'CSV Data' },
      { ext: 'pdf', label: 'PDF Audit Report' }
    ],
    lastGenerated: 'Today, 10:45 AM'
  },
  {
    id: 'inventory',
    title: 'Catalog & Inventory Audit',
    icon: BookOpen,
    iconColor: 'from-blue-500 to-indigo-600',
    description: 'Full book repository index, ISBN registry, shelf locations, lost or damaged copies, and stock counts.',
    formats: [
      { ext: 'csv', label: 'CSV Catalog' },
      { ext: 'excel', label: 'Excel (XLSX)' }
    ],
    lastGenerated: 'Yesterday, 04:20 PM'
  },
  {
    id: 'users',
    title: 'Member Activity & Demographics',
    icon: Users,
    iconColor: 'from-purple-500 to-pink-600',
    description: 'Registered student/faculty roster, active membership tiers, check-in history, and engagement telemetry.',
    formats: [
      { ext: 'csv', label: 'CSV Roster' },
      { ext: 'pdf', label: 'Member Summary PDF' }
    ],
    lastGenerated: '3 days ago'
  },
  {
    id: 'circulation',
    title: 'Circulation & Issue Lifecycle',
    icon: BarChart3,
    iconColor: 'from-amber-500 to-orange-600',
    description: 'Borrowing volume trends, return turnaround latency, active loans, and overdue risk assessment.',
    formats: [
      { ext: 'csv', label: 'CSV Stream' },
      { ext: 'excel', label: 'Excel Workbook' }
    ],
    lastGenerated: 'Today, 02:15 PM'
  }
];

const Reports = () => {
  const [downloading, setDownloading] = useState({});
  const [timeframe, setTimeframe] = useState('30d');

  const handleDownload = async (type, format) => {
    const key = `${type}-${format}`;
    const normFormat = format === 'excel' ? 'xlsx' : format;
    try {
      setDownloading(prev => ({ ...prev, [key]: true }));
      toast.loading(`Generating ${type} report in ${normFormat.toUpperCase()} format...`, { id: 'report' });
      
      const res = await api.post('/v1/export', { type, format: normFormat, timeframe });
      if (res.data?.success && res.data?.data) {
        const jobId = res.data.data._id;
        const downloadRes = await api.get(`/v1/export/download/${jobId}`, { responseType: 'blob' });
        const blob = new Blob([downloadRes.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_report_${Date.now()}.${normFormat}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Report downloaded successfully!`, { id: 'report' });
      } else {
        toast.error(res.data?.message || 'Failed to generate report', { id: 'report' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to trigger report generation. Check system logs.', { id: 'report' });
      console.error(error);
    } finally {
      setDownloading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Reporting Engine
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                v2.0 Analytics
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Generate enterprise-grade compliance audits, inventory rosters, and financial telemetry
            </p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-white/10 self-start md:self-auto">
          {['7d', '30d', '90d', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === t
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Time' : `Last ${t.replace('d', ' Days')}`}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Audit Compliance</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>100% Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">SOC-2 & FERPA aligned records</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Export Throughput</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            Instant Stream
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Direct Cloud Generation</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Format Matrix</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">CSV</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">XLSX</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs">PDF</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High-density data serialization</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Data Freshness</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>Real-time</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero ETL caching latency</p>
        </div>
      </div>

      {/* Main Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {REPORT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${cat.iconColor} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Last run: {cat.lastGenerated}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {cat.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {cat.formats.map((fmt) => {
                    const isBusy = downloading[`${cat.id}-${fmt.ext}`];
                    return (
                      <button
                        key={fmt.ext}
                        disabled={isBusy}
                        onClick={() => handleDownload(cat.id, fmt.ext)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white transition shadow-sm disabled:opacity-50 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isBusy ? 'Generating...' : fmt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Auto-validated
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit & Compliance Footer Notice */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-500" />
          <span>All generated exports are cryptographically hashed and logged to the tenant audit trail.</span>
        </div>
        <a 
          href="/audit" 
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
        >
          <span>View Audit Log</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default Reports;
