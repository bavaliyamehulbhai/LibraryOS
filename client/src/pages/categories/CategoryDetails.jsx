import React from "react";
import { useParams, Link } from "react-router-dom";
import { useCategory, useCategoryStats } from "../../hooks/useCategories";
import { ArrowLeft, Edit, FolderTree, BookOpen } from "lucide-react";
import { format } from "date-fns";

const CategoryDetails = () => {
  const { id } = useParams();
  const { data: categoryData, isLoading, isError } = useCategory(id);
  const { data: statsData } = useCategoryStats(id);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading category details...</div>;
  if (isError || !categoryData?.data) return <div className="p-8 text-center text-red-500">Category not found or failed to load.</div>;

  const category = categoryData.data;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/categories" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Category Details</h1>
        </div>
        <Link 
          to={`/categories/edit/${category._id}`} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Edit size={18} />
          Edit Category
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl shadow-sm"
              style={{ backgroundColor: category.color || "#2563eb" }}
            >
              <FolderTree size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{category.name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Created {format(new Date(category.createdAt), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-8 border-t py-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Parent Category</p>
              <p className="font-medium text-gray-900">
                {category.parentCategory ? category.parentCategory.name : "None (Root Category)"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>

          {category.description && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border">
                {category.description}
              </p>
            </div>
          )}
        </div>

        {/* Analytics Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Category Stats</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <BookOpen size={24} />
                </div>
                <span className="text-gray-600 font-medium">Total Books</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {statsData?.data?.books ?? 0}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500 text-center bg-gray-50 py-3 rounded border">
            These metrics reflect books exclusively in this category.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
