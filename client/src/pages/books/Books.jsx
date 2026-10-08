import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks, useDeleteBook } from "../../hooks/useBooks";
import { 
  Plus, Search, Edit, Trash2, Eye, LayoutGrid, 
  List, BookOpen, Sparkles, Filter, X 
} from "lucide-react";
import toast from "react-hot-toast";
import { confirmAlert } from "../../utils/confirmAlert";

const Books = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, AVAILABLE, ISSUED

  const { data, isLoading, isError } = useBooks({ search, page, limit: 12 });
  const { mutate: deleteBook } = useDeleteBook();

  const handleDelete = async (id) => {
    if (await confirmAlert("Are you sure you want to delete this book?")) {
      deleteBook(id, {
        onSuccess: () => toast.success("Book deleted successfully"),
        onError: () => toast.error("Failed to delete book")
      });
    }
  };

  const booksList = data?.data?.books || [];
  const filteredBooks = booksList.filter(book => {
    if (statusFilter === "ALL") return true;
    return book.status === statusFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Collection Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Books Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Catalog, track physical copies, e-books, and availability across your library.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/books/new" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add New Book</span>
          </Link>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
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

        {/* Status Filter Pills & View Mode Toggles */}
        <div className="flex flex-wrap items-center justify-between w-full lg:w-auto gap-3">
          
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            {["ALL", "AVAILABLE", "ISSUED"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {status === "ALL" ? "All Books" : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Total: <strong className="text-indigo-600 dark:text-indigo-400">{data?.data?.total || filteredBooks.length}</strong>
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition ${viewMode === "table" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                title="Grid / Cover View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="glass-panel rounded-2xl overflow-hidden relative min-h-[420px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Loading Catalog...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-500 p-4 rounded-full mb-3">
              <BookOpen size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Failed to load catalog</h3>
            <p className="text-xs text-slate-500 mt-1">Please verify connection or refresh page.</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mb-3">
              <Search size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No books found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Try adjusting your search query, clearing filters, or adding a new book to the inventory.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5 w-20">Cover</th>
                  <th className="px-5 py-3.5">Book Details</th>
                  <th className="px-5 py-3.5">Language</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-5 py-3.5">
                      {book.coverImage ? (
                        <div className="w-12 h-16 rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      ) : (
                        <div className="w-12 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700">
                          <BookOpen size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <Link to={`/books/${book._id}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
                          {book.title}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">ISBN: {book.isbn || "N/A"}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {book.author && (
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              By {book.author.name}
                            </span>
                          )}
                          {book.category && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                              {book.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {book.language || "English"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                        book.status === "AVAILABLE"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                      }`}>
                        {book.status || "AVAILABLE"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link 
                          to={`/books/${book._id}`} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to={`/books/edit/${book._id}`} 
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Book"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(book._id)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete Book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
              <div 
                key={book._id} 
                className="group flex flex-col justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 shadow-inner">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <BookOpen size={28} />
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                    book.status === "AVAILABLE"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-amber-500/90 text-white"
                  }`}>
                    {book.status || "AVAILABLE"}
                  </span>
                </div>

                <div>
                  <Link to={`/books/${book._id}`} className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1 mb-0.5">
                    {book.title}
                  </Link>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {book.author?.name || "Unknown Author"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400">
                    {book.category?.name || "General"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link to={`/books/${book._id}`} className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                      <Eye size={14} />
                    </Link>
                    <Link to={`/books/edit/${book._id}`} className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                      <Edit size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Pagination Bar */}
      {data?.data?.totalPages > 1 && (
        <div className="flex items-center justify-between glass-panel px-4 py-3 rounded-2xl text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Page <strong className="text-slate-900 dark:text-white">{page}</strong> of <strong className="text-slate-900 dark:text-white">{data.data.totalPages}</strong>
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button 
              disabled={page === data.data.totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Books;

