import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRequestExport, useExportProgress } from "../../hooks/useExport";
import { DownloadCloud, FileText, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const ExportCenter = () => {
  const [type, setType] = useState("books");
  const [format, setFormat] = useState("xlsx");
  const [jobId, setJobId] = useState(null);

  const exportMutation = useRequestExport();
  const { data: progressData } = useExportProgress(jobId);
  const job = progressData?.data;

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      const res = await exportMutation.mutateAsync({ type, format });
      setJobId(res.data._id);
    } catch (err) {
      alert("Failed to start export");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Export Command Center</h1>
          <p className="text-gray-500">Generate reports, backups, and analytics across LibraryOS.</p>
        </div>
        <div className="space-x-4">
          <Link to="/export/scheduled" className="text-blue-600 hover:underline text-sm font-medium">Scheduled Reports</Link>
          <Link to="/export/history" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">View History</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div className="bg-white border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <DownloadCloud className="text-blue-500" /> Generate New Report
          </h2>
          
          <form onSubmit={handleExport} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Data Module</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-3 bg-gray-50 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="books">Book Catalog</option>
                <option value="inventory">Inventory & Stock</option>
                <option value="authors">Authors</option>
                <option value="publishers">Publishers</option>
                <option value="categories">Categories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  type="button" 
                  onClick={() => setFormat("xlsx")}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${format === 'xlsx' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                >
                  <FileSpreadsheet size={24} />
                  <span className="font-bold text-sm uppercase">Excel</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormat("csv")}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${format === 'csv' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                >
                  <FileText size={24} />
                  <span className="font-bold text-sm uppercase">CSV</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormat("pdf")}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${format === 'pdf' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                >
                  <FileText size={24} />
                  <span className="font-bold text-sm uppercase">PDF</span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={exportMutation.isPending || (jobId && job?.status !== 'COMPLETED' && job?.status !== 'FAILED')}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow"
            >
              {exportMutation.isPending ? "Initializing..." : "Start Engine"}
            </button>
          </form>
        </div>

        {/* Right: Progress Panel */}
        <div>
          {jobId ? (
            <div className="bg-white border rounded-xl p-8 shadow-sm h-full flex flex-col justify-center text-center">
              {job?.status === "PENDING" && <Loader2 className="animate-spin text-gray-400 mx-auto mb-4" size={48}/>}
              {job?.status === "PROCESSING" && <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48}/>}
              {job?.status === "COMPLETED" && <CheckCircle className="text-green-500 mx-auto mb-4" size={48}/>}
              {job?.status === "FAILED" && <AlertTriangle className="text-red-500 mx-auto mb-4" size={48}/>}
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Job: {job?.fileName || "Preparing"}</h3>
              <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-6">{job?.status || "QUEUED"}</p>

              {job?.status === "COMPLETED" && (
                <div className="space-y-4">
                  <p className="text-green-600 font-medium">Export generation is complete and ready for download.</p>
                  <a 
                    href={`${process.env.REACT_APP_API_URL}/v1/export/download/${jobId}`} 
                    download
                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-green-700 transition"
                  >
                    Download File
                  </a>
                </div>
              )}

              {job?.status === "FAILED" && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                  An error occurred while generating the export. Please try again.
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 h-full flex flex-col items-center justify-center text-gray-400">
              <DownloadCloud size={64} className="mb-4 opacity-20" />
              <p className="text-lg">Waiting for export command...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportCenter;
