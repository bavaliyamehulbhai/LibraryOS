import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/v1/vendors');
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    switch (score) {
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const analyzeVendor = async (vendorId) => {
    setAnalyzingId(vendorId);
    try {
      const res = await api.get(`/v1/vendors/${vendorId}/insights`);
      if (res.data.success) {
        setAiInsight(prev => ({ ...prev, [vendorId]: res.data.data }));
        toast.success("AI Insight Generated");
      }
    } catch (error) {
      toast.error("Failed to generate insight");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-4xl">🏢</span> Vendor Management
        </h1>
        <p className="text-gray-500 mt-2">Manage library suppliers, track SLAs, and analyze vendor risk profiles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Total Vendors</span>
          <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{vendors.length}</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Active Partners</span>
          <h2 className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
            {vendors.filter(v => v.status === 'APPROVED').length}
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400 font-medium">High Risk Vendors</span>
          <h2 className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">
            {vendors.filter(v => v.riskScore === 'HIGH').length}
          </h2>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center">
           <span className="font-bold flex items-center mb-1"><span className="text-2xl mr-2">✨</span> AI Powered</span>
           <p className="text-xs text-indigo-100">Grok analyzes SLA metrics to predict vendor reliability.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
           <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 md:flex justify-between items-start gap-6">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{vendor.companyName}</h3>
                    <span className="text-yellow-500 font-bold text-sm bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                      ★ {vendor.rating.toFixed(1)}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRiskColor(vendor.riskScore)}`}>
                      {vendor.riskScore} RISK
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Contact: {vendor.name} ({vendor.email})</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                        <span className="block text-gray-500">Status</span>
                        <span className="font-bold text-gray-900 dark:text-white">{vendor.status}</span>
                     </div>
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                        <span className="block text-gray-500">Orders Completed</span>
                        <span className="font-bold text-gray-900 dark:text-white">{vendor.ordersCompleted}</span>
                     </div>
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                        <span className="block text-gray-500">Revenue (Total)</span>
                        <span className="font-bold text-green-600 dark:text-green-400">₹{vendor.revenueGenerated}</span>
                     </div>
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                        <span className="block text-gray-500">Verified Docs</span>
                        <span className="font-bold text-gray-900 dark:text-white text-xs">GST, PAN</span>
                     </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 w-full md:w-80 flex flex-col justify-start">
                   <button 
                     onClick={() => analyzeVendor(vendor._id)}
                     disabled={analyzingId === vendor._id}
                     className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {analyzingId === vendor._id ? (
                        <><div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
                     ) : (
                        <><span>🤖</span> Generate AI Insight</>
                     )}
                   </button>
                   
                   {aiInsight[vendor._id] && (
                     <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Grok Analysis</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                          "{aiInsight[vendor._id]}"
                        </p>
                     </div>
                   )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
