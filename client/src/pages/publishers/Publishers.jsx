import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePublishers, useDeletePublisher } from "../../hooks/usePublishers";
import { 
  Plus, Search, Edit, Trash2, Eye, Building2, 
  X, ChevronLeft, ChevronRight, Mail, Sparkles 
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { confirmAlert } from "../../utils/confirmAlert";

const Publishers = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePublishers({ search, page, limit: 10 });
  const { mutate: deletePublisher } = useDeletePublisher();

  const handleDelete = async (id) => {
    if (await confirmAlert("Are you sure you want to delete this publisher?")) {
      deletePublisher(id, {
        onSuccess: () => toast.success("Publisher deleted successfully"),
        onError: () => toast.error("Failed to delete publisher")
      });
    }
  };

  const publishers = data?.data || [];
  const totalCount = data?.total || publishers.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Publishing Houses & Imprints
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={28} />
            Publishers Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Maintain institutional publisher profiles, licensing contacts, and imprint attributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/publishers/create" 
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Publisher</span>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search publishers by name..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          {search && (
            <button 
              onClick={() => setSearch("")} 
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
          Total Imprints: <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">LOADING PUBLISHERS...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-rose-500 text-sm font-semibold">
            Failed to load library publishers. Please refresh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Publishing House</th>
                  <th className="px-6 py-4">Contact Channel</th>
                  <th className="px-6 py-4">Cataloged On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {publishers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="text-4xl mb-3">🏢</div>
                      No publishing imprints found matching your query.
                    </td>
                  </tr>
                ) : (
                  publishers.map((pub) => {
                    const initials = pub.name ? pub.name.slice(0, 2).toUpperCase() : 'PB';
                    return (
                      <tr key={pub._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{pub.name}</div>
                              {pub.address && (
                                <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{pub.address}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {pub.email ? (
                            <span className="text-slate-600 dark:text-slate-300 font-mono text-xs flex items-center gap-1.5">
                              <Mail size={13} className="text-emerald-500" />
                              {pub.email}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">No direct email</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                          {format(new Date(pub.createdAt), "MMM dd, yyyy")}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                          <Link 
                            to={`/publishers/${pub._id}`} 
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-block transition"
                            title="View Publisher"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link 
                            to={`/publishers/edit/${pub._id}`} 
                            className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-block transition"
                            title="Edit Publisher"
                          >
                            <Edit size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(pub._id)} 
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Delete Publisher"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Page {page} of {data.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronLeft size={14} className="inline mr-1" />
                Previous
              </button>
              <button 
                disabled={page === data.totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                Next
                <ChevronRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Publishers;
