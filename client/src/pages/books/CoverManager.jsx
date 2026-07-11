import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGallery, useCoverStats, useUploadCover, useRemoveCover } from "../../hooks/useMedia";
import { Image as ImageIcon, UploadCloud, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { confirmAlert } from "../../utils/confirmAlert";

const CoverManager = () => {
  const [params, setParams] = useState({ page: 1, limit: 10, hasCover: "false", search: "" });
  const { data, isLoading } = useGallery(params);
  const { data: statsData } = useCoverStats();
  
  const uploadMutation = useUploadCover();
  const removeMutation = useRemoveCover();
  
  const books = data?.data || [];
  const stats = statsData?.data;
  const pagination = data?.pagination;

  const handleUpload = async (bookId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await uploadMutation.mutateAsync({ bookId, formData });
    } catch (err) {
      alert("Failed to upload cover.");
    }
  };

  const handleRemove = async (bookId) => {
    if (await confirmAlert("Are you sure you want to remove this cover image?")) {
      try {
        await removeMutation.mutateAsync(bookId);
      } catch (err) {
        alert("Failed to remove cover.");
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cover Manager</h1>
          <p className="text-gray-500">Audit your catalog and upload missing book covers.</p>
        </div>
        <Link to="/books/gallery" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">Back to Gallery</Link>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Books With Covers</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats?.booksWithCover || 0}</p>
          </div>
          <CheckCircle className="text-green-200" size={32} />
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Missing Covers</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats?.booksWithoutCover || 0}</p>
          </div>
          <AlertTriangle className="text-red-200" size={32} />
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Total Uploads</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.totalUploads || 0}</p>
          </div>
          <UploadCloud className="text-blue-200" size={32} />
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex gap-4">
            <select 
              value={params.hasCover}
              onChange={(e) => setParams({...params, hasCover: e.target.value, page: 1})}
              className="border rounded p-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="false">Show Missing Covers</option>
              <option value="true">Show Existing Covers</option>
              <option value="">Show All Books</option>
            </select>
            <input 
              type="text" 
              placeholder="Search Title/ISBN..." 
              value={params.search}
              onChange={(e) => setParams({...params, search: e.target.value, page: 1})}
              className="border rounded p-2 text-sm focus:outline-none focus:border-blue-500 min-w-[250px]"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Cover</th>
              <th className="px-6 py-4">Book Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="4" className="text-center py-10 text-gray-400">Loading books...</td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium">No books match this criteria.</td></tr>
            ) : (
              books.map(book => (
                <tr key={book._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-16 h-24 bg-gray-100 border rounded flex items-center justify-center overflow-hidden">
                      {book.thumbnail ? (
                        <img src={book.thumbnail} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={24} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-500">{book.author?.name}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{book.isbn}</p>
                  </td>
                  <td className="px-6 py-4">
                    {book.coverImage ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max">
                        <CheckCircle size={14} /> Has Cover
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max">
                        <AlertTriangle size={14} /> Missing
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <input 
                          type="file" 
                          id={`upload-${book._id}`} 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleUpload(book._id, e.target.files[0])}
                        />
                        <label 
                          htmlFor={`upload-${book._id}`}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold cursor-pointer transition flex items-center gap-2"
                        >
                          <UploadCloud size={16} /> {book.coverImage ? "Replace" : "Upload"}
                        </label>
                      </div>
                      
                      {book.coverImage && (
                        <button 
                          onClick={() => handleRemove(book._id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                          title="Remove Cover"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-sm">
            <span className="text-gray-600">Showing {books.length} of {pagination.total} books</span>
            <div className="flex gap-2">
              <button 
                disabled={params.page === 1}
                onClick={() => setParams({...params, page: params.page - 1})}
                className="px-3 py-1 border rounded bg-white disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                disabled={params.page === pagination.pages}
                onClick={() => setParams({...params, page: params.page + 1})}
                className="px-3 py-1 border rounded bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverManager;
