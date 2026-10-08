import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { 
  Plus, Search, Edit, Trash2, Eye, FolderTree, 
  X, ChevronLeft, ChevronRight, Sparkles, Layers 
} from "lucide-react";
import toast from "react-hot-toast";
import { confirmAlert } from "../../utils/confirmAlert";
import { format } from "date-fns";

const Categories = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCategories({ search, page, limit: 10 });
  const { mutate: deleteCategory } = useDeleteCategory();

  const handleDelete = async (id) => {
    if (await confirmAlert("Are you sure you want to delete this category? Books linked to it may lose their genre classification.")) {
      deleteCategory(id, {
        onSuccess: () => toast.success("Category deleted successfully"),
        onError: () => toast.error("Failed to delete category")
      });
    }
  };

  const categories = data?.data || [];
  const totalCount = data?.total || categories.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Taxonomy & Classification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderTree className="text-indigo-600 dark:text-indigo-400" size={28} />
            Categories & Genres
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Structure your library collection into hierarchical disciplines, genres, and sub-categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/categories/create" 
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search categories by name..."
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
          Total Classifications: <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">LOADING CATEGORIES...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-rose-500 text-sm font-semibold">
            Failed to load library categories. Please refresh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Hierarchy / Parent</th>
                  <th className="px-6 py-4">Cataloged On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="text-4xl mb-3">📁</div>
                      No categories found matching your query.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm" 
                            style={{ backgroundColor: category.color || "#6366f1" }}
                          >
                            <FolderTree size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{category.name}</div>
                            {category.description && (
                              <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{category.description}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.parentCategory ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                            {category.parentCategory.name}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            Root Discipline
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                        {format(new Date(category.createdAt), "MMM dd, yyyy")}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                        <Link 
                          to={`/categories/${category._id}`} 
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-block transition"
                          title="View Category"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to={`/categories/edit/${category._id}`} 
                          className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-block transition"
                          title="Edit Category"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(category._id)} 
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
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

export default Categories;
