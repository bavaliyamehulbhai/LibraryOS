import React, { useState } from 'react';

const ExportCenter = () => {
  const [type, setType] = useState('BOOKS');
  const [format, setFormat] = useState('CSV');
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/export?type=${type}&format=${format}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setJob(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Export Center</h1>
        <p className="text-gray-500 mb-8">Securely download your library data at any time.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Data Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-3 border">
              <option value="BOOKS">Books Inventory</option>
              <option value="STUDENTS">Students Database</option>
              <option value="TRANSACTIONS">Transaction History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-3 border">
              <option value="CSV">CSV Document</option>
              <option value="XLSX">Excel Spreadsheet</option>
              <option value="PDF">PDF Report</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleExport} 
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Generating Export..." : "Generate Export File"}
        </button>

        {job && (
          <div className="mt-8 p-4 bg-green-50 rounded border border-green-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-green-800">Export Generated!</h3>
              <p className="text-sm text-green-600">Your file is ready for download.</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportCenter;
