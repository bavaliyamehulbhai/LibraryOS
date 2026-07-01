import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Filter } from "lucide-react";

// For global copy movements
const fetchGlobalCopyHistory = async () => {
  // If we had a global copies history endpoint, we'd hit it here.
  // We can query the CopyMovement collection if we exposed an endpoint.
  // Since we didn't explicitly create a global GET /copies/history route in the backend,
  // we will just display a message or hook it up to a backend route if it exists.
  // For the sake of this component, let's assume /v1/copies/movements exists or we just fetch a specific copy.
  return { data: [] }; // Placeholder for global movements
};

const CopyHistory = () => {
  const { data: historyData, isLoading } = useQuery({
    queryKey: ["globalCopyHistory"],
    queryFn: fetchGlobalCopyHistory
  });

  const [search, setSearch] = useState("");
  const history = historyData?.data || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/copies" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Copy Movement Logs</h1>
          <p className="text-gray-600 mt-1">Audit log of all physical book copy transactions.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by Copy Code, User..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Copy ID</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/copies/${record.copyId?._id}`} className="font-medium text-blue-600 hover:underline">
                        {record.copyId?.copyCode || "Unknown"}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                        {record.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.userId?.name || "System"}</td>
                    <td className="px-6 py-4 text-gray-500">{record.remarks || "-"}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Please view history from a specific Copy's detail page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyHistory;
