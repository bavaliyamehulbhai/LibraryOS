import React from "react";
import { Link } from "react-router-dom";
import { useSecurityLogs } from "../../hooks/useAudit";
import { ShieldAlert, Shield, ShieldCheck, AlertOctagon } from "lucide-react";

const severityColors = {
  "LOW": "bg-blue-100 text-blue-800 border-blue-200",
  "MEDIUM": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "HIGH": "bg-orange-100 text-orange-800 border-orange-200",
  "CRITICAL": "bg-red-100 text-red-800 border-red-200"
};

const SecurityLogs = () => {
  const { data, isLoading } = useSecurityLogs();
  const logs = data?.data || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Security Logs
          </h1>
          <p className="text-gray-500">Monitor failed logins, permission violations, and account locks.</p>
        </div>
        <Link to="/audit/compliance" className="bg-slate-800 text-white px-4 py-2 rounded font-medium hover:bg-slate-700 transition">View Compliance Report</Link>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading security events...</td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <ShieldCheck className="mx-auto text-green-400 mb-3" size={48} />
                    <p className="text-gray-500 font-medium">No security events found. Your system is secure.</p>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-red-50 transition group">
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 w-max ${severityColors[log.severity] || severityColors.LOW}`}>
                        {log.severity === 'CRITICAL' ? <AlertOctagon size={12} /> : <Shield size={12} />} {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-gray-800">{log.event}</span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      {log.userId ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{log.userId.name}</span>
                          <span className="text-[10px] text-gray-400">{log.userId.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{log.ipAddress || 'N/A'}</td>
                    <td className="px-6 py-3 text-xs text-gray-600 truncate max-w-[250px]" title={log.details}>
                      {log.details || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
