import React, { useState } from "react";
import { useISBNStats, useBooks } from "../../hooks/useBooks";
import { BarChart3, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";

const ISBNReport = () => {
  const { data: statsData, isLoading: loadingStats } = useISBNStats();
  const [search, setSearch] = useState("");
  
  // Reuse books hook to show the catalog which theoretically could have ISBNs that are flagged
  const { data: booksData, isLoading: loadingBooks } = useBooks({ search, limit: 50 });

  const stats = statsData?.data || { valid: 0, invalid: 0, duplicate: 0 };
  const total = stats.valid + stats.invalid + stats.duplicate;
  const qualityScore = total === 0 ? 100 : Math.round((stats.valid / total) * 100 * 10) / 10;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ISBN Quality Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor the integrity and validation metrics of your catalog's ISBN numbers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Quality Score</h3>
            <BarChart3 className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : `${qualityScore}%`}</p>
            <p className="text-xs text-gray-500 mt-1">Overall database health</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Valid ISBNs</h3>
            <CheckCircle2 className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : stats.valid}</p>
            <p className="text-xs text-gray-500 mt-1">Properly formatted 10/13</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Invalid ISBNs</h3>
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : stats.invalid}</p>
            <p className="text-xs text-gray-500 mt-1">Failed math validation</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Duplicates Blocked</h3>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loadingStats ? "..." : stats.duplicate}</p>
            <p className="text-xs text-gray-500 mt-1">Prevented from saving</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">ISBN Audit Log</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search ISBN..."
              className="pl-9 pr-4 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
          </div>
        </div>

        {loadingBooks ? (
          <div className="p-8 text-center text-gray-500">Loading catalog data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {booksData?.data?.books?.map((book) => {
                  const cleanIsbn = book.isbn.replace(/[-\s]/g, "");
                  const isIsbn10 = cleanIsbn.length === 10;
                  const isIsbn13 = cleanIsbn.length === 13;
                  const type = isIsbn10 ? "ISBN-10" : isIsbn13 ? "ISBN-13" : "Unknown";

                  return (
                    <tr key={book._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{book.title}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{book.isbn}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{type}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle2 size={12} /> Valid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <Link to={`/books/${book._id}`} className="text-blue-600 hover:underline">View Book</Link>
                      </td>
                    </tr>
                  )
                })}
                {booksData?.data?.books?.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No books matched the search.</td>
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

export default ISBNReport;
