import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import StatCard from '../../components/common/StatCard';

const InvoiceAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/billing/invoices-analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load invoice analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Financial Reports...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tax & Invoice Analytics</h1>
        <p className="text-gray-500">Super Admin view for GST compliance and invoice tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Invoices" value={data?.totalInvoices || 0} icon={FileText} color="blue" />
        <StatCard title="Paid Invoices" value={data?.paidInvoices || 0} icon={CheckCircle} color="green" />
        <StatCard title="Overdue Invoices" value={data?.overdueInvoices || 0} icon={AlertTriangle} color="red" />
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500">Total GST Collected</p>
          <div className="mt-2 flex items-baseline">
            <DollarSign className="w-6 h-6 text-indigo-600 mr-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{data?.gstCollected?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
         <h2 className="text-xl font-bold mb-4">Compliance Reports</h2>
         <p className="text-gray-500 mb-6">Download your quarterly GST compliance reports directly from the system.</p>
         <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow transition">
           Export Q3 Tax Report (.csv)
         </button>
      </div>
    </div>
  );
};

export default InvoiceAnalytics;
