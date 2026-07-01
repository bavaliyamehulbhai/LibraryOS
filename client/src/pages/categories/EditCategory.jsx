import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCategory, useUpdateCategory, useCategories } from "../../hooks/useCategories";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const EditCategory = () => {
  const { id } = useParams();
  const { data: categoryData, isLoading } = useCategory(id);
  const { mutate: updateCategory, isPending } = useUpdateCategory();
  const { data: categoriesData } = useCategories({ limit: 100 }); 
  
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (categoryData?.data) {
      reset({
        name: categoryData.data.name,
        description: categoryData.data.description,
        parentCategory: categoryData.data.parentCategory?._id || "",
        color: categoryData.data.color,
      });
    }
  }, [categoryData, reset]);

  const onSubmit = (data) => {
    if (!data.parentCategory) {
      data.parentCategory = null;
    }
    
    updateCategory({ id, data }, {
      onSuccess: () => {
        toast.success("Category updated successfully!");
        navigate("/categories");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to update category");
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading category details...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/categories" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input 
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
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
              {categoriesData?.data?.filter(c => c._id !== id).map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
            <div className="flex items-center gap-3">
              <input 
                type="color"
                {...register("color")}
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
              {isPending ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
