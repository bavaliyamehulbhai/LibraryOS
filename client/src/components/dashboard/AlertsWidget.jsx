import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";

const AlertsWidget = ({ lowStock = [], securityAlerts = [] }) => {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">Alerts Center</h2>
        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {lowStock.length + securityAlerts.length} issues
        </span>
      </div>
      <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        {lowStock.length === 0 && securityAlerts.length === 0 ? (
          <div className="p-8 text-center text-green-500 font-medium text-sm">System is healthy. No alerts.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {securityAlerts.map((alert, idx) => (
              <li key={`sec-${idx}`} className="p-4 bg-red-50 hover:bg-red-100 transition border-l-4 border-l-red-500">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert size={14} className="text-red-600" />
                  <span className="font-bold text-red-800 text-sm">{alert.event}</span>
                </div>
                <p className="text-xs text-red-600">{alert.details}</p>
              </li>
            ))}
            {lowStock.map((item, idx) => (
              <li key={`stk-${idx}`} className="p-4 bg-orange-50 hover:bg-orange-100 transition border-l-4 border-l-orange-500">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-orange-600" />
                  <span className="font-bold text-orange-800 text-sm">Low Stock: {item.title}</span>
                </div>
                <p className="text-xs text-orange-600">Only {item.available} copies available</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AlertsWidget;
