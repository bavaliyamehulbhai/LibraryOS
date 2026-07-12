import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks, useDeleteBook } from "../../hooks/useBooks";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { confirmAlert } from "../../utils/confirmAlert";

const Books = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useBooks({ search, page, limit: 10 });
  const { mutate: deleteBook } = useDeleteBook();

  const handleDelete = async (id) => {
    if (await confirmAlert("Are you sure you want to delete this book?")) {
      deleteBook(id, {
        onSuccess: () => toast.success("Book deleted successfully"),
        onError: () => toast.error("Failed to delete book")
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Books Catalog</h1>
          <p className="text-slate-500 mt-1">Manage and track your entire library collection.</p>
        </div>
        <Link 
          to="/books/create" 
          className="group flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-medium shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95"
        >
          <Plus size={18} className="transition-transform group-hover:rotate-90" />
          Add New Book
        </Link>
      </div>

      {/* Toolbar Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-slate-700 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
        </div>
        
        {/* Optional Filter/Sort Placeholder */}
        <div className="text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2">
          Total Books: <span className="text-indigo-600 font-bold">{data?.data?.total || 0}</span>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading catalog...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
            <div className="bg-red-50 text-red-500 p-4 rounded-full mb-3">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Failed to load books</h3>
            <p className="text-slate-500 mt-1">Please try refreshing the page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Cover</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Book Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.data?.books?.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      {book.coverImage ? (
                        <div className="relative w-14 h-20 group-hover:-translate-y-1 transition-transform duration-300">
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-lg shadow-sm border border-slate-200/60" />
                          <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10"></div>
                        </div>
                      ) : (
                        <div className="w-14 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 border border-slate-200 border-dashed">
                          <Eye size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link to={`/books/${book._id}`} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1 mb-0.5">
                          {book.title}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono mb-2">ISBN: {book.isbn}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {book.author && (
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              By {book.author.name}
                            </span>
                          )}
                          {book.category && (
                            <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-medium border border-indigo-100/50">
                              {book.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {book.language}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full border
                        ${book.status === 'AVAILABLE' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' 
                          : 'bg-amber-50 text-amber-600 border-amber-200/60'}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/books/${book._id}`} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/books/edit/${book._id}`} 
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Book"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(book._id)} 
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {data?.data?.books?.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-slate-50 text-slate-400 p-4 rounded-full mb-3">
                          <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No books found</h3>
                        <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                          We couldn't find any books matching your search. Try different keywords or add a new book.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Pagination */}
      {data?.data?.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-600 font-medium">
            Showing page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{data.data.totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-slate-200 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={page === data.data.totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-slate-200 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
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
