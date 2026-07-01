import React from "react";
import { Link } from "react-router-dom";
import { useComplianceReport } from "../../hooks/useAudit";
import { FileCheck, ShieldAlert, Edit3, Users } from "lucide-react";

const ComplianceReports = () => {
  const { data, isLoading } = useComplianceReport();
  const report = data?.data || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileCheck className="text-green-500" /> Compliance Report
          </h1>
          <p className="text-gray-500">Executive summary of library security and audit health.</p>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition hidden md:block">
          Print PDF
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Generating compliance report...</div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Security Alerts */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-t-4 border-t-red-500">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><ShieldAlert size={18} className="text-red-500" /> High-Risk Security Events</h2>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{report.securityEvents?.length || 0}</span>
              </div>
              <div className="p-4">
                {report.securityEvents?.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No high-risk security events logged.</p>
                ) : (
                  <ul className="space-y-3">
                    {report.securityEvents?.map((event, idx) => (
                      <li key={idx} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{event.event}</p>
                          <p className="text-xs text-gray-500">{event.details}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 rounded">{new Date(event.createdAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent Critical Edits */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-t-4 border-t-blue-500">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><Edit3 size={18} className="text-blue-500" /> Recent Critical Edits</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{report.recentEdits?.length || 0}</span>
              </div>
              <div className="p-4">
                {report.recentEdits?.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No recent critical edits (Updates/Deletes).</p>
                ) : (
                  <ul className="space-y-3">
                    {report.recentEdits?.map((edit, idx) => (
                      <li key={idx} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{edit.action} <span className="text-gray-400 font-normal">on</span> {edit.entity}</p>
                          <p className="text-xs text-gray-500">By {edit.performedBy?.name || 'System'}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 rounded">{new Date(edit.createdAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Most Active Users */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-t-4 border-t-purple-500 md:col-span-2">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><Users size={18} className="text-purple-500" /> Most Active Users</h2>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {report.activeUsers?.length === 0 ? (
                  <p className="text-sm text-gray-500 italic col-span-5">No activity recorded.</p>
                ) : (
                  report.activeUsers?.map((user, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded text-center border">
                      <p className="font-bold text-sm text-gray-800 truncate" title={user.name}>{user.name}</p>
                      <p className="text-xs text-gray-500 mt-1"><span className="font-bold text-purple-600">{user.count}</span> actions</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceReports;
