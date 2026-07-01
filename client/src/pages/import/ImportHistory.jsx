import React from "react";
import { Link } from "react-router-dom";
import { useImportHistory } from "../../hooks/useImport";
import { FileSpreadsheet, Download, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const ImportHistory = () => {
  const { data, isLoading, error } = useImportHistory();
  const history = data?.data || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Import History</h1>
          <p className="text-gray-500">Track all bulk imports across the LibraryOS ecosystem.</p>
        </div>
        <Link to="/import" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition">New Import</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading history...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded text-center">Failed to load import history.</div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <FileSpreadsheet size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No Imports Yet</h3>
          <p className="text-gray-500 mt-2">You haven't imported any files into the system.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Rows</th>
                <th className="px-6 py-4">Success</th>
                <th className="px-6 py-4">Failed</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="text-gray-400" size={16} />
                      <span className="font-medium text-gray-900">{job.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {job.status === 'COMPLETED' && <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-bold"><CheckCircle size={12}/> Completed</span>}
                    {job.status === 'FAILED' && <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-bold"><AlertTriangle size={12}/> Failed</span>}
                    {job.status === 'PROCESSING' && <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold"><Clock size={12}/> Processing</span>}
                    {job.status === 'PENDING' && <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-bold">Pending</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{job.totalRows}</td>
                  <td className="px-6 py-4 text-green-600 font-mono font-bold">{job.successRows}</td>
                  <td className="px-6 py-4 text-red-600 font-mono font-bold">{job.failedRows}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(job.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {job.failedRows > 0 && job.status === 'COMPLETED' && (
                      <a 
                        href={`${process.env.REACT_APP_API_URL}/v1/import/${job._id}/errors`} 
                        download
                        title="Download Error Report"
                        className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 p-1.5 rounded inline-block transition"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ImportHistory;
