import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { Plus, Search, Edit, Trash2, Eye, FolderTree } from "lucide-react";
import toast from "react-hot-toast";
import { confirmAlert } from "../../utils/confirmAlert";
import { format } from "date-fns";

const Categories = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCategories({ search, page, limit: 10 });
  const { mutate: deleteCategory } = useDeleteCategory();

  const handleDelete = async (id) => {
    if (await confirmAlert("Are you sure you want to delete this category?")) {
      deleteCategory(id, {
        onSuccess: () => toast.success("Category deleted successfully"),
        onError: () => toast.error("Failed to delete category")
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
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <Link 
          to="/categories/create" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Category
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load categories.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data?.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white" 
                          style={{ backgroundColor: category.color || "#2563eb" }}
                        >
                          <FolderTree size={16} />
                        </div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.parentCategory ? category.parentCategory.name : <span className="text-gray-400 italic">None (Root)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(category.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link to={`/categories/${category._id}`} className="text-gray-500 hover:text-blue-600 transition">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/categories/edit/${category._id}`} className="text-gray-500 hover:text-green-600 transition">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(category._id)} className="text-gray-500 hover:text-red-600 transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No categories found.
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

export default Categories;
