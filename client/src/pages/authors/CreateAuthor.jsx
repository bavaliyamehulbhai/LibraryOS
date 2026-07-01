import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useCreateAuthor } from "../../hooks/useAuthors";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const CreateAuthor = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { mutate: createAuthor, isPending } = useCreateAuthor();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    // Clean up empty date string
    if (!data.dateOfBirth) {
      delete data.dateOfBirth;
    }

    createAuthor(data, {
      onSuccess: () => {
        toast.success("Author created successfully!");
        navigate("/authors");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to create author");
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/authors" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Add New Author</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
              <input 
                {...register("name", { required: "Name is required" })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. James Clear"
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input 
                {...register("country")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="USA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input 
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input 
                type="url"
                {...register("website")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://jamesclear.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input 
                type="date"
                {...register("dateOfBirth")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
              <input 
                {...register("image")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Cloudinary URL"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
              <textarea 
                {...register("biography")}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Author's bio..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Link 
              to="/authors" 
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Author"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuthor;
