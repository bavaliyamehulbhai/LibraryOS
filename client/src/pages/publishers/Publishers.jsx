import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePublishers, useDeletePublisher } from "../../hooks/usePublishers";
import { Plus, Search, Edit, Trash2, Eye, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const Publishers = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePublishers({ search, page, limit: 10 });
  const { mutate: deletePublisher } = useDeletePublisher();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this publisher?")) {
      deletePublisher(id, {
        onSuccess: () => toast.success("Publisher deleted successfully"),
        onError: () => toast.error("Failed to delete publisher")
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Publishers</h1>
        <Link 
          to="/publishers/create" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Publisher
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search publishers by name..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <div className="text-sm text-gray-500">
          Total Publishers: {data?.total || 0}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading publishers...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load publishers.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data?.map((publisher) => (
                  <tr key={publisher._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {publisher.logo ? (
                          <img src={publisher.logo} alt={publisher.name} className="w-10 h-10 rounded-md object-contain bg-gray-50 border" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 border">
                            <Building2 size={20} />
                          </div>
                        )}
                        <div className="font-medium text-gray-900">{publisher.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {publisher.email || <span className="text-gray-400 italic">No email</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(publisher.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link to={`/publishers/${publisher._id}`} className="text-gray-500 hover:text-blue-600 transition">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/publishers/edit/${publisher._id}`} className="text-gray-500 hover:text-green-600 transition">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(publisher._id)} className="text-gray-500 hover:text-red-600 transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No publishers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {data.totalPages}</span>
            <button 
              disabled={page === data.totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publishers;
