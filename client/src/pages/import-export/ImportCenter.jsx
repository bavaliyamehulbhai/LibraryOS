import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, RefreshCw, BookOpen, Users, 
  Clock, DownloadCloud, FileCheck
} from 'lucide-react';

const IMPORT_TYPES = [
  { id: 'BOOKS', label: 'Books Inventory', desc: 'Title, Author, ISBN, Category, Total Copies & Shelf', sample: 'books_template.csv', icon: BookOpen },
  { id: 'STUDENTS', label: 'Members & Students', desc: 'Full Name, Member ID, Email, Department & Tier', sample: 'members_template.csv', icon: Users },
  { id: 'TRANSACTIONS', label: 'Past Circulation', desc: 'Borrow Date, Due Date, Member ID & Book ISBN', sample: 'circulation_template.csv', icon: Clock }
];

const ImportCenter = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('BOOKS');
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV or XLSX file first");
      return;
    }
    setLoading(true);
    setJob(null);
    toast.loading("Analyzing and validating rows...", { id: 'import' });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await api.post("/v1/import/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setJob(res.data.data);
        toast.success("Import batch queued successfully!", { id: 'import' });
      } else {
        toast.error(res.data.message || "Import failed", { id: 'import' });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Import execution encountered an error", { id: 'import' });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Data Migration Center
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                Bulk Ingestion
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Rapidly ingest your legacy Excel or CSV datasets into LibraryOS with auto-mapping
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Select Type */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Step 1: Target Destination Table
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {IMPORT_TYPES.map(item => {
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

        {/* Step 2: Upload Dropzone */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 2: Upload CSV or Excel Spreadsheet
            </label>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline flex items-center gap-1">
              <DownloadCloud className="w-3.5 h-3.5" />
              Download Sample Template
            </span>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[0.99]'
                : file
                  ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20'
            }`}
          >
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              onChange={e => setFile(e.target.files[0])} 
              className="hidden" 
              id="file-upload" 
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{file.name}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB • Click to change file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Drag and drop file here, or <span className="text-blue-600 dark:text-blue-400 hover:underline">browse</span>
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports .CSV and .XLSX up to 25MB (max 50,000 rows per batch)
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleUpload} 
          disabled={loading || !file}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Importing Dataset into Database...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Initialize Batch Import</span>
            </>
          )}
        </button>

        {/* Generated Success Card */}
        {job && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-xl p-5 flex items-center gap-4 animate-in fade-in duration-300">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                Migration Pipeline Dispatched!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Job ID: {job._id || 'JOB-RUNNING'} • Records are being validated and inserted in background.
              </p>
            </div>
          </div>
        )}

        {/* Security & Isolation Callout */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Automatic schema validation • Duplicate ISBNs and Member IDs are automatically reconciled</span>
        </div>
      </div>
    </div>
  );
};

export default ImportCenter;
