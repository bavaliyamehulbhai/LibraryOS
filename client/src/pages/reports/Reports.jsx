import React from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Reports = () => {
  const handleDownload = async (type, format) => {
    try {
      toast.loading(`Generating ${type} report in ${format.toUpperCase()} format...`, { id: 'report' });
      const res = await api.post('/v1/export', { type, format });
      if (res.data.success) {
        toast.success('Report generation started. You will be notified when it is ready.', { id: 'report' });
      }
    } catch (error) {
      toast.error('Failed to start report generation', { id: 'report' });
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reporting Engine</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Generate, schedule, and export platform analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center text-xl font-bold mb-2 text-gray-900 dark:text-white">
              <span className="mr-2">💰</span> Financial Reports
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Export transaction revenue, late fines, and subscription billings.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleDownload('financial', 'csv')} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded font-medium">Download CSV</button>
            <button onClick={() => handleDownload('financial', 'pdf')} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded font-medium">Download PDF</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center text-xl font-bold mb-2 text-gray-900 dark:text-white">
              <span className="mr-2">📚</span> Inventory Reports
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Library book catalogs, lost inventory, and top borrowed books.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleDownload('inventory', 'csv')} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded font-medium">Download CSV</button>
            <button onClick={() => handleDownload('inventory', 'excel')} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded font-medium">Download Excel</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center text-xl font-bold mb-2 text-gray-900 dark:text-white">
              <span className="mr-2">👥</span> User Activity Reports
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Student login activity, active users, and staff actions.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleDownload('users', 'csv')} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded font-medium">Download CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
