import React, { useState } from 'react';
import api from '../../services/api';

const ImportCenter = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('BOOKS');
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    
    try {
      const res = await api.post("/v1/import/upload", { type });
      if (res.data.success) {
        setJob(res.data.data);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Migration Center</h1>
        <p className="text-gray-500 mb-8">Seamlessly import your legacy Excel or CSV data into LibraryOS.</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">What are you importing?</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-3 border">
            <option value="BOOKS">Books Inventory</option>
            <option value="STUDENTS">Students Database</option>
            <option value="TRANSACTIONS">Past Transactions</option>
          </select>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center mb-6">
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            onChange={e => setFile(e.target.files[0])} 
            className="hidden" 
            id="file-upload" 
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
              {file ? file.name : "Select a CSV or XLSX file"}
            </span>
            <span className="mt-1 block text-xs text-gray-500">Max file size 10MB</span>
          </label>
        </div>

        <button 
          onClick={handleUpload} 
          disabled={loading || !file}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Initializing Import..." : "Start Import Engine"}
        </button>

        {job && (
          <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-100">
            <h3 className="font-semibold text-blue-800">Import Started!</h3>
            <p className="text-sm text-blue-600">Your data is being processed in the background. Job ID: {job._id}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCenter;
