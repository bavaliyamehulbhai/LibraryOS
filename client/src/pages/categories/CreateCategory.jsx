import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useCreateCategory, useCategories } from "../../hooks/useCategories";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const CreateCategory = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { mutate: createCategory, isPending } = useCreateCategory();
  // Fetch all categories to populate the Parent Category dropdown
  const { data: categoriesData } = useCategories({ limit: 100 }); 
  const navigate = useNavigate();

  const onSubmit = (data) => {
    // If parentCategory is empty string, convert to null
    if (!data.parentCategory) {
      data.parentCategory = null;
    }
    
    createCategory(data, {
      onSuccess: () => {
        toast.success("Category created successfully!");
        navigate("/categories");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to create category");
      }
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/categories" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Add New Category</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input 
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Technology"
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select 
              {...register("parentCategory")}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">None (Root Category)</option>
              {categoriesData?.data?.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select a parent to make this a sub-category.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
            <div className="flex items-center gap-3">
              <input 
                type="color"
                {...register("color")}
                defaultValue="#2563eb"
                className="h-10 w-10 p-1 border rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">Pick a color for this category icon</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Link 
              to="/categories" 
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;
