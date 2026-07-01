import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = (type) => {
    setLoading(true);
    // Simulate generation time
    setTimeout(() => {
      setLoading(false);
      toast.success(`${type} Report generated and ready for download!`);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📄</span> Executive Reports
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Generate and download comprehensive library performance reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Monthly Report */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              📅
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Monthly Overview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mb-6">
              A detailed breakdown of all transactions, new members, and fines collected over the last 30 days.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleGenerateReport('Monthly PDF')}
                disabled={loading}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg text-sm transition"
              >
                PDF
              </button>
              <button 
                onClick={() => handleGenerateReport('Monthly CSV')}
                disabled={loading}
                className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg text-sm transition border border-green-200"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Quarterly Report */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col relative overflow-hidden">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quarterly Review</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mb-6">
              Macro trends in reading habits, collection utilization, and library revenue over the last 3 months.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleGenerateReport('Quarterly PDF')}
                disabled={loading}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg text-sm transition"
              >
                PDF
              </button>
              <button 
                onClick={() => handleGenerateReport('Quarterly Excel')}
                disabled={loading}
                className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg text-sm transition border border-green-200"
              >
                Excel
              </button>
            </div>
          </div>

          {/* Risk Report */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/50 p-6 flex flex-col">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Risk Audit</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mb-6">
              Complete list of all outstanding fines, lost books, and suspended accounts requiring immediate attention.
            </p>
            <button 
              onClick={() => handleGenerateReport('Risk PDF')}
              disabled={loading}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-sm transition border border-red-200"
            >
              Generate Risk Report (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
