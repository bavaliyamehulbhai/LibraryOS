import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCopies } from "../../hooks/useCopies";
import { Search, Tag, Filter, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

const Copies = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  const { data: copiesData, isLoading } = useCopies({ 
    search: search.length > 2 ? search : "", 
    status: statusFilter, 
    condition: conditionFilter 
  });

  const copies = copiesData?.data || [];

  const renderStatusBadge = (status) => {
    switch(status) {
      case "AVAILABLE": return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Available</span>;
      case "ISSUED": return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold w-max">Issued</span>;
      case "RESERVED": return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold w-max">Reserved</span>;
      case "LOST": return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-max"><XCircle size={12}/> Lost</span>;
      case "DAMAGED": return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-max"><AlertTriangle size={12}/> Damaged</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Physical Copies</h1>
          <p className="text-gray-600 mt-1">Manage individual barcodes and specific book copies.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by Copy Code, Barcode..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-gray-500" />
            <select 
              className="w-full sm:w-auto border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ISSUED">Issued</option>
              <option value="RESERVED">Reserved</option>
              <option value="DAMAGED">Damaged</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          
          <select 
            className="w-full sm:w-auto border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="">All Conditions</option>
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="DAMAGED">Damaged</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={24} /> Loading physical copies...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Copy ID & Book</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Location / Shelf</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {copies.map((copy) => (
                  <tr key={copy._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-800 p-2 rounded">
                          <Tag size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 font-mono">{copy.copyCode}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{copy.bookId?.title || "Unknown Book"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(copy.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border
                        ${copy.condition === 'NEW' ? 'bg-green-50 text-green-700 border-green-200' : 
                          copy.condition === 'GOOD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          copy.condition === 'DAMAGED' || copy.condition === 'POOR' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      `}>
                        {copy.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {copy.shelfId?.name ? (
                        <div>
                          <div className="font-medium">{copy.shelfId.name}</div>
                          <div className="text-xs text-gray-400">{copy.shelfId.location}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/copies/${copy._id}`} className="text-blue-600 hover:underline font-medium">View Copy</Link>
                    </td>
                  </tr>
                ))}
                {copies.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No copies matched the search filters.
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

export default Copies;
