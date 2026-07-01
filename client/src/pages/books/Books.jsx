import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks, useDeleteBook } from "../../hooks/useBooks";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";

const Books = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useBooks({ search, page, limit: 10 });
  const { mutate: deleteBook } = useDeleteBook();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Books Catalog</h1>
        <Link 
          to="/books/create" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Book
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by Title or ISBN..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading books...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load books.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data?.books?.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                      ) : (
                        <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500 mb-1">{book.isbn}</div>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {book.author && <span className="text-blue-600 font-medium">By {book.author.name}</span>}
                        {book.category && <span className="text-purple-600 bg-purple-50 inline-block px-1.5 py-0.5 rounded w-fit border border-purple-100">{book.category.name}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{book.language}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link to={`/books/${book._id}`} className="text-gray-500 hover:text-blue-600 transition">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/books/edit/${book._id}`} className="text-gray-500 hover:text-green-600 transition">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(book._id)} className="text-gray-500 hover:text-red-600 transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.data?.books?.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No books found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      {data?.data?.totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {data.data.totalPages}</span>
            <button 
              disabled={page === data.data.totalPages} 
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

export default Books;
