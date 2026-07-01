import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useInventoryHistory } from "../../hooks/useInventory";
import { ArrowLeft, Search, Filter } from "lucide-react";

const StockMovement = () => {
  const { data: historyData, isLoading } = useInventoryHistory();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const history = historyData?.data || [];

  const filteredHistory = history.filter(record => {
    const matchesSearch = record.bookId?.title?.toLowerCase().includes(search.toLowerCase()) || 
                          record.bookId?.isbn?.includes(search) ||
                          record.userId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "ALL" || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const types = ["ALL", "STOCK_ADDED", "STOCK_REMOVED", "BOOK_ISSUED", "BOOK_RETURNED", "BOOK_RESERVED", "BOOK_DAMAGED", "BOOK_LOST"];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Global Stock Movement</h1>
          <p className="text-gray-600 mt-1">Audit log of all inventory transactions.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by Title, ISBN, or User..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-500" />
          <select 
            className="w-full md:w-auto border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {types.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading movement history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">User / Agent</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(record.createdAt).toLocaleDateString()}<br/>
                      <span className="text-xs text-gray-400">{new Date(record.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/inventory/${record.bookId?._id}`} className="font-medium text-blue-600 hover:underline">
                        {record.bookId?.title || "Unknown Book"}
                      </Link>
                      <div className="text-xs text-gray-500">{record.bookId?.isbn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.type.includes('ADDED') || record.type.includes('RETURNED') ? 'bg-green-100 text-green-800' : 
                          record.type.includes('REMOVED') || record.type.includes('ISSUED') ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'}`}>
                        {record.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-700">
                      {record.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {record.userId?.name || "System"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={record.reason}>
                      {record.reason || "-"}
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No matching records found.
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

export default StockMovement;
