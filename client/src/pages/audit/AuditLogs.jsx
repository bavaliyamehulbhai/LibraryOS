import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuditLogs } from "../../hooks/useAudit";
import { Database, Search, Filter } from "lucide-react";

const AuditLogs = () => {
  const [params, setParams] = useState({ page: 1, limit: 50, action: "", module: "" });
  const { data, isLoading } = useAuditLogs(params);
  
  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-blue-500" /> System Audit Logs
          </h1>
          <p className="text-gray-500">Forensic-level tracking of all critical system data changes.</p>
        </div>
        <Link to="/audit/activity" className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100 transition">View Live Feed</Link>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex gap-4">
          <div className="flex-1 max-w-xs relative">
            <input 
              type="text" 
              placeholder="Search by Action (e.g. BOOK_UPDATED)" 
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={params.action}
              onChange={(e) => setParams({...params, action: e.target.value.toUpperCase(), page: 1})}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <div className="flex-1 max-w-xs relative">
            <input 
              type="text" 
              placeholder="Filter by Module/Entity..." 
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={params.module}
              onChange={(e) => setParams({...params, module: e.target.value, page: 1})}
            />
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading audit trail...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500 font-medium">No logs found matching criteria.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs">{log.action}</span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-700">{log.entity}</td>
                    <td className="px-6 py-3">
                      {log.performedBy ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{log.performedBy.name}</span>
                          <span className="text-[10px] text-gray-400">{log.performedBy.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">System</span>
                      )}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{log.ipAddress || 'N/A'}</td>
                    <td className="px-6 py-3 text-xs text-gray-500 truncate max-w-[200px]" title={log.details || "No details"}>
                      {log.details || (log.newData ? "Data updated" : "-")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-sm">
            <span className="text-gray-600">Showing {logs.length} records</span>
            <div className="flex gap-2">
              <button 
                disabled={params.page === 1}
                onClick={() => setParams({...params, page: params.page - 1})}
                className="px-3 py-1 border rounded bg-white disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                disabled={params.page === pagination.pages}
                onClick={() => setParams({...params, page: params.page + 1})}
                className="px-3 py-1 border rounded bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
