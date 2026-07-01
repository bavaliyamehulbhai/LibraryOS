import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGallery } from "../../hooks/useMedia";
import { Image as ImageIcon, Filter, Search } from "lucide-react";

const BookGallery = () => {
  const [params, setParams] = useState({ page: 1, limit: 24, hasCover: "", search: "" });
  const { data, isLoading } = useGallery(params);
  const books = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visual Catalog</h1>
          <p className="text-gray-500">Browse the library visually using cover images.</p>
        </div>
        <Link to="/books/cover-manager" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition">Cover Manager</Link>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm mb-8 flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="Search titles..." 
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            value={params.search}
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-500"
            value={params.hasCover}
            onChange={(e) => setParams({ ...params, hasCover: e.target.value, page: 1 })}
          >
            <option value="">All Books</option>
            <option value="true">With Covers</option>
            <option value="false">Missing Covers</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading gallery...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No Books Found</h3>
          <p className="text-gray-500 mt-2">Adjust your search or filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {books.map(book => (
              <Link key={book._id} to={`/books/${book._id}`} className="group block">
                <div className="relative aspect-[2/3] w-full rounded-lg shadow-sm border overflow-hidden bg-gray-100 mb-3 group-hover:shadow-md transition">
                  {book.thumbnail || book.coverImage ? (
                    <img 
                      src={book.thumbnail || book.coverImage} 
                      alt={book.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300 p-4 text-center">
                      <ImageIcon size={32} className="mb-2" />
                      <span className="text-xs font-medium">No Cover</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
                      book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      book.status === 'ISSUED' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {book.status}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-sm text-gray-800 truncate" title={book.title}>{book.title}</h4>
                <p className="text-xs text-gray-500 truncate">{book.author?.name || 'Unknown Author'}</p>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button 
                disabled={params.page === 1}
                onClick={() => setParams({...params, page: params.page - 1})}
                className="px-4 py-2 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {params.page} of {pagination.pages}</span>
              <button 
                disabled={params.page === pagination.pages}
                onClick={() => setParams({...params, page: params.page + 1})}
                className="px-4 py-2 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookGallery;
