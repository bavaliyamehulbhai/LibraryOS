import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
  Download, Database, FileSpreadsheet, FileText, CheckCircle2, 
  ArrowRight, ShieldCheck, RefreshCw, BookOpen, Users, Clock 
} from 'lucide-react';

const DATA_TYPES = [
  { id: 'BOOKS', label: 'Books Inventory', desc: 'All catalogued titles, ISBNs, shelf placements & copies', icon: BookOpen },
  { id: 'STUDENTS', label: 'Members & Students', desc: 'Registered patrons, contact information & membership tiers', icon: Users },
  { id: 'TRANSACTIONS', label: 'Circulation History', desc: 'Checkout, return records, overdue alerts & fines ledger', icon: Clock }
];

const FORMATS = [
  { id: 'CSV', label: 'CSV File', ext: '.csv', desc: 'Standard comma-delimited for raw data workflows', icon: FileText },
  { id: 'XLSX', label: 'Excel Workbook', ext: '.xlsx', desc: 'Formatted multi-column spreadsheet for Microsoft Excel', icon: FileSpreadsheet },
  { id: 'PDF', label: 'PDF Document', ext: '.pdf', desc: 'Printable executive summary format', icon: FileText }
];

const ExportCenter = () => {
  const [type, setType] = useState('BOOKS');
  const [format, setFormat] = useState('CSV');
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setJob(null);
    toast.loading(`Compiling ${type} in ${format}...`, { id: 'export' });
    try {
      const res = await api.post('/v1/export', { 
        type: type.toLowerCase(), 
        format: format.toLowerCase() 
      });
      if (res.data?.success) {
        const token = localStorage.getItem("token") || "";
        const rawUrl = res.data.data.downloadUrl || `/api/v1/export/download/${res.data.data._id}`;
        const downloadUrl = rawUrl.includes("?") ? `${rawUrl}&token=${token}` : `${rawUrl}?token=${token}`;
        setJob({ ...res.data.data, downloadUrl });
        toast.success("Export generated successfully!", { id: 'export' });
      } else {
        toast.error(res.data?.message || "Export failed to start", { id: 'export' });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Export request failed. Try again.", { id: 'export' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Data Export Center
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                v2.0 Data Hub
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Securely stream, backup, and package your library dataset into portable standard formats
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Select Data Entity */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Step 1: Choose Dataset to Export
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DATA_TYPES.map(item => {
              const Icon = item.icon;
              const isSelected = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {item.label}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Format */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Step 2: Choose Output Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FORMATS.map(item => {
              const Icon = item.icon;
              const isSelected = format === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.ext}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {item.label}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleExport} 
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Payload...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Generate & Download Export</span>
            </>
          )}
        </button>

        {/* Generated Success Card */}
        {job && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Export Ready for Extraction
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Payload compiled: {type}_{format.toLowerCase()}_{new Date().toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
            {job.downloadUrl && (
              <a 
                href={job.downloadUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Disk</span>
              </a>
            )}
          </div>
        )}

        {/* Security & Isolation Callout */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Tenant encryption key enforced • All PII complies with local privacy regulations</span>
        </div>
      </div>
    </div>
  );
};

export default ExportCenter;
