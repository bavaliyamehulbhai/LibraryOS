import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUploadImport, useImportProgress } from "../../hooks/useImport";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

const BookImport = () => {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  
  const uploadMutation = useUploadImport();
  const { data: progressData } = useImportProgress(jobId);
  const job = progressData?.data;

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e) => e.preventDefault();

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadMutation.mutateAsync(formData);
      setJobId(res.data._id);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    }
  };

  const getPercentage = () => {
    if (!job) return 0;
    if (job.totalRows === 0) return 0;
    return Math.round((job.processedRows / job.totalRows) * 100);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bulk Import Books</h1>
          <p className="text-gray-500">Upload CSV or Excel files to rapidly populate your library catalog.</p>
        </div>
        <div className="space-x-4">
          <a href={`${process.env.REACT_APP_API_URL}/v1/import/import-template`} download className="text-blue-600 hover:underline text-sm font-medium">Download Template</a>
          <Link to="/import/history" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">View History</Link>
        </div>
      </div>

      {!jobId ? (
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-blue-300 bg-blue-50/30 rounded-xl p-12 text-center transition hover:bg-blue-50/50"
        >
          <UploadCloud className="mx-auto text-blue-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Drag and drop your file here</h3>
          <p className="text-gray-500 mb-6">Supports .CSV, .XLS, and .XLSX (Max 50MB)</p>
          
          <input 
            type="file" 
            id="fileInput" 
            className="hidden" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="fileInput" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg cursor-pointer font-medium hover:bg-blue-700 transition shadow-sm">
            Browse Files
          </label>

          {file && (
            <div className="mt-8 bg-white border p-4 rounded-lg flex items-center justify-between max-w-md mx-auto shadow-sm">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-green-600" size={24} />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={handleUpload} 
                disabled={uploadMutation.isPending}
                className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {uploadMutation.isPending ? "Uploading..." : "Start Import"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            {job?.status === "PROCESSING" && <Loader2 className="animate-spin text-blue-500" size={24}/>}
            {job?.status === "COMPLETED" && <CheckCircle className="text-green-500" size={24}/>}
            {job?.status === "FAILED" && <AlertTriangle className="text-red-500" size={24}/>}
            Import Status: {job?.status || "PENDING"}
          </h2>

          <div className="mb-6">
            <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
              <span>Progress</span>
              <span>{getPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-4 transition-all duration-500 ${job?.status === 'COMPLETED' ? 'bg-green-500' : job?.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-600'}`} 
                style={{ width: `${getPercentage()}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total Rows</p>
              <p className="text-2xl font-bold text-gray-800">{job?.totalRows || 0}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Processed</p>
              <p className="text-2xl font-bold text-blue-800">{job?.processedRows || 0}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Success</p>
              <p className="text-2xl font-bold text-green-800">{job?.successRows || 0}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Failed</p>
              <p className="text-2xl font-bold text-red-800">{job?.failedRows || 0}</p>
            </div>
          </div>

          {job?.status === "COMPLETED" && job.failedRows > 0 && (
            <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-orange-800 text-sm">Action Required: Data Anomalies Detected</h4>
                <p className="text-xs text-orange-600 mt-1">{job.failedRows} rows could not be imported due to validation errors.</p>
              </div>
              <a 
                href={`${process.env.REACT_APP_API_URL}/v1/import/${jobId}/errors`} 
                download
                className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-orange-700"
              >
                Download Error Report
              </a>
            </div>
          )}

          {job?.status === "COMPLETED" && job.failedRows === 0 && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="font-bold text-green-800">Excellent! All rows were successfully imported without any errors.</p>
            </div>
          )}

          {(job?.status === "COMPLETED" || job?.status === "FAILED") && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => { setJobId(null); setFile(null); }}
                className="text-blue-600 hover:underline font-medium"
              >
                Upload another file
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default BookImport;
