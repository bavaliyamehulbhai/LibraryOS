import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useInventoryList, useInventoryStats } from "../../hooks/useInventory";
import { Search, Package, PackageCheck, PackageMinus, PackageX, History, Activity } from "lucide-react";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const { data: statsData, isLoading: loadingStats } = useInventoryStats();
  const { data: inventoryData, isLoading: loadingInventory } = useInventoryList();

  const stats = statsData?.data || { totalCopies: 0, available: 0, issued: 0, damaged: 0, lost: 0 };
  const inventoryList = inventoryData?.data || [];

  const filteredInventory = inventoryList.filter(item => 
    item.bookId?.title?.toLowerCase().includes(search.toLowerCase()) || 
    item.bookId?.isbn?.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage physical book stock.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/inventory/movements" 
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition"
          >
            <History size={18} />
            Movement History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Copies</h3>
            <Package className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : stats.totalCopies}</p>
            <p className="text-xs text-gray-500 mt-1">Across all books</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Available Copies</h3>
            <PackageCheck className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : stats.available}</p>
            <p className="text-xs text-gray-500 mt-1">Ready to be issued</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Issued Copies</h3>
            <PackageMinus className="text-purple-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : stats.issued}</p>
            <p className="text-xs text-gray-500 mt-1">Currently with readers</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Damaged / Lost</h3>
            <PackageX className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : (stats.damaged + stats.lost)}</p>
            <p className="text-xs text-gray-500 mt-1">Needs replacement</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Current Stock Levels</h2>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by Title or ISBN..."
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {loadingInventory ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <Activity className="animate-spin text-blue-500" />
            Loading inventory data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Damaged/Lost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.bookId?.coverImage ? (
                          <img src={item.bookId.coverImage} alt="cover" className="w-10 h-14 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{item.bookId?.title || "Unknown Book"}</div>
                          <div className="text-xs text-gray-500">ISBN: {item.bookId?.isbn}</div>
                          {item.availableCopies < 3 && item.totalCopies > 0 && (
                            <span className="inline-block mt-1 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-semibold">Low Stock</span>
                          )}
                          {item.availableCopies === 0 && item.totalCopies > 0 && (
                            <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">{item.totalCopies}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-green-600">{item.availableCopies}</td>
                    <td className="px-6 py-4 text-center text-sm text-purple-600">{item.issuedCopies}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">{item.reservedCopies}</td>
                    <td className="px-6 py-4 text-center text-sm text-red-500">{item.damagedCopies + item.lostCopies}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link to={`/inventory/${item.bookId?._id}`} className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded transition">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No inventory records found.</td>
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

export default Inventory;
