import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, Download, CreditCard, Search, X, CheckCircle2, 
  Clock, AlertCircle, ShieldCheck, ArrowRight, DollarSign,
  Building2, Printer, Filter
} from 'lucide-react';

const STATUS_BADGES = {
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  OVERDUE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/billing/invoices');
      if (res.data.success) {
        setInvoices(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoiceId, invoiceNumber) => {
    toast.loading('Generating invoice PDF...', { id: 'pdf' });
    try {
      const response = await api.get(`/billing/invoices/${invoiceId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber || invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice PDF downloaded!', { id: 'pdf' });
    } catch {
      toast.error("Failed to download PDF. It may not have been generated yet.", { id: 'pdf' });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    const matchNum = (inv.invoiceNumber || '').toLowerCase().includes(q);
    const matchPlan = (inv.planId?.planName || inv.planName || '').toLowerCase().includes(q);
    return matchNum || matchPlan;
  });

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const paidCount = invoices.filter(inv => inv.status === 'PAID').length;
  const pendingCount = invoices.filter(inv => inv.status === 'PENDING').length;
  const pendingAmount = invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const exportCSV = () => {
    if (invoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    try {
      const headers = ["Invoice_Number", "Plan_Name", "Total_Amount", "Status", "Due_Date", "Created_At"];
      const rows = invoices.map(inv => [
        `"${inv.invoiceNumber || ''}"`,
        `"${inv.planId?.planName || 'Standard'}"`,
        inv.totalAmount || 0,
        `"${inv.status || ''}"`,
        `"${inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : ''}"`,
        `"${new Date(inv.createdAt).toISOString().slice(0, 10)}"`
      ]);

      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `LibraryOS_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Invoices exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Institutional Invoices & Billing</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  GST Compliant
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Download tax invoices, track subscription billing schedules, and manage campus fee receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/subscriptions"
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition flex items-center gap-2"
          >
            <CreditCard size={15} />
            <span>Manage Subscription</span>
          </Link>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Download size={15} />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Billed</span>
            <DollarSign size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{invoices.length} invoices generated</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Invoices</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {paidCount}
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium">Fully paid & cleared</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Dues</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ₹{pendingAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-500 mt-1 font-medium">{pendingCount} pending payment</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tax Verification</span>
            <ShieldCheck size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            18% GST
          </div>
          <p className="text-[11px] text-purple-500 mt-1 font-medium">B2B Input Tax Credit</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by invoice number or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            {[
              { id: 'ALL', label: 'All Invoices' },
              { id: 'PAID', label: 'Paid & Settled' },
              { id: 'PENDING', label: 'Pending Dues' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <span className="text-sm font-medium">Fetching invoice ledger...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Plan / Service</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-slate-400">
                      <div className="max-w-xs mx-auto text-center space-y-2">
                        <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Invoices Found</h4>
                        <p className="text-xs">No records matched your search or status filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {invoice.invoiceNumber || 'INV-000'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {invoice.planId?.planName || invoice.planName || 'Enterprise Subscription'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Auto-Renew Monthly
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                        ₹{invoice.totalAmount?.toLocaleString() || 0}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border font-mono ${STATUS_BADGES[invoice.status] || STATUS_BADGES.PENDING}`}>
                          {invoice.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5"
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>

                          {invoice.status === 'PENDING' && (
                            <Link 
                              to="/subscriptions"
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1"
                            >
                              <span>Pay Now</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Invoices;
