import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProcurementDashboard = () => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/v1/procurement/budget');
      if (res.data.success) {
        setBudget(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load procurement dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">📊</span> Procurement Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Manage your branch budget and purchase requests.</p>
        </div>
      </div>

      {budget && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Allocated Budget (FY {budget.fiscalYear})</h3>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">₹{budget.allocatedBudget.toLocaleString()}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Utilized Budget</h3>
            <p className="text-4xl font-bold text-red-500">₹{budget.utilizedBudget.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl shadow-sm text-white">
            <h3 className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2">Remaining Budget</h3>
            <p className="text-4xl font-bold">₹{budget.remainingBudget.toLocaleString()}</p>
            <div className="w-full bg-green-800/50 rounded-full h-2 mt-4 overflow-hidden">
               <div 
                  className="bg-white h-2 rounded-full" 
                  style={{ width: `${(budget.utilizedBudget / budget.allocatedBudget) * 100}%` }}
               ></div>
            </div>
            <p className="text-xs text-green-100 mt-2">
              {((budget.utilizedBudget / budget.allocatedBudget) * 100).toFixed(1)}% utilized
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Links</h2>
         <div className="flex justify-center gap-4">
            <a href="/procurement/requests" className="px-6 py-3 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-100 transition">View Purchase Requests</a>
            <a href="/procurement/approvals" className="px-6 py-3 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-bold rounded-lg hover:bg-purple-100 transition">Pending Approvals</a>
            <a href="/procurement/grn" className="px-6 py-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold rounded-lg hover:bg-green-100 transition">Goods Receipt (GRN)</a>
         </div>
      </div>

    </div>
  );
};

export default ProcurementDashboard;
