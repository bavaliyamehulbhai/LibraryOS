import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.get(`/v1/branch-analytics/reports/export?format=${format}`);
      if (res.data.success) {
        toast.success(`Report generated! Downloading ${format.toUpperCase()}...`);
        // In a real app, this would trigger a file download using the returned URL or blob
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📄</span> Executive Reports
          </h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">Generate and export multi-branch performance reports.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Export Options</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={(e) => setFormat(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">PDF Document</span>
                  <span className="ml-auto text-sm text-gray-500">Best for sharing & printing</span>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <input type="radio" name="format" value="excel" checked={format === 'excel'} onChange={(e) => setFormat(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">Excel Spreadsheet</span>
                  <span className="ml-auto text-sm text-gray-500">Best for custom data analysis</span>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={(e) => setFormat(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">CSV File</span>
                  <span className="ml-auto text-sm text-gray-500">Raw data export</span>
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={generating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:bg-blue-400"
            >
              {generating ? 'Generating Report...' : `Export as ${format.toUpperCase()}`}
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
};

export default Reports;
