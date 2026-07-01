import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useBook, useUpdateBook } from "../../hooks/useBooks";
import { useCategories } from "../../hooks/useCategories";
import { useAuthors } from "../../hooks/useAuthors";
import { usePublishers } from "../../hooks/usePublishers";
import { useISBNValidation } from "../../hooks/useISBNValidation";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

const EditBook = () => {
  const { id } = useParams();
  const { data: bookData, isLoading } = useBook(id);
  const { mutate: updateBook, isPending } = useUpdateBook();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: authorsData } = useAuthors({ limit: 100 });
  const { data: publishersData } = usePublishers({ limit: 100 });

  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  
  const watchedIsbn = watch("isbn", "");
  const { isValid, isDuplicate, isLoading: checkingIsbn } = useISBNValidation(watchedIsbn, id);

  useEffect(() => {
    if (bookData?.data) {
      const b = bookData.data;
      reset({
        title: b.title,
        isbn: b.isbn,
        language: b.language,
        coverImage: b.coverImage,
        description: b.description,
        category: b.category?._id || "",
        author: b.author?._id || "",
        publisher: b.publisher?._id || "",
      });
    }
  }, [bookData, reset]);

  const onSubmit = (data) => {
    if (isValid === false) {
      toast.error("Please enter a mathematically valid ISBN.");
      return;
    }
    if (isDuplicate) {
      toast.error("This ISBN already exists in your library.");
      return;
    }

    // Convert empty strings to undefined or delete them so they don't cause cast errors
    if (!data.category) delete data.category;
    if (!data.author) delete data.author;
    if (!data.publisher) delete data.publisher;
    
    updateBook({ id, data }, {
      onSuccess: () => {
        toast.success("Book updated successfully!");
        navigate("/books");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to update book");
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading book details...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/books" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Book</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input 
                {...register("title", { required: "Title is required" })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">ISBN *</label>
                {watchedIsbn && (
                  <div className="text-xs font-medium flex items-center gap-1">
                    {checkingIsbn ? (
                      <span className="text-gray-500 flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> Checking...</span>
                    ) : isDuplicate ? (
                      <span className="text-red-600 flex items-center gap-1"><AlertCircle size={12} /> Duplicate</span>
                    ) : isValid === false ? (
                      <span className="text-red-600 flex items-center gap-1"><XCircle size={12} /> Invalid</span>
                    ) : isValid === true ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Valid</span>
                    ) : null}
                  </div>
                )}
              </div>
              <input 
                {...register("isbn", { required: "ISBN is required" })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 outline-none transition ${
                  watchedIsbn ? (isValid === false || isDuplicate ? "border-red-500 focus:ring-red-500" : isValid === true && !isDuplicate ? "border-green-500 focus:ring-green-500" : "focus:ring-blue-500") : "focus:ring-blue-500"
                }`}
              />
              {errors.isbn && <span className="text-red-500 text-xs">{errors.isbn.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                {...register("category")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Category</option>
                {categoriesData?.data?.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <select 
                {...register("author")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Author</option>
                {authorsData?.data?.map(author => (
                  <option key={author._id} value={author._id}>{author.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <select 
                {...register("publisher")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Publisher</option>
                {publishersData?.data?.map(pub => (
                  <option key={pub._id} value={pub._id}>{pub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input 
                {...register("language")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input 
                {...register("coverImage")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Link 
              to="/books" 
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? "Updating..." : "Update Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
