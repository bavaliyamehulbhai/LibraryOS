import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useBook, useUpdateBook } from "../../hooks/useBooks";
import { useCategories } from "../../hooks/useCategories";
import { useAuthors } from "../../hooks/useAuthors";
import { usePublishers } from "../../hooks/usePublishers";
import { useISBNValidation } from "../../hooks/useISBNValidation";
import toast from "react-hot-toast";
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, 
  Loader2, BookOpen, Save, Image, Sparkles 
} from "lucide-react";

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
  const watchedTitle = watch("title", "");
  const watchedCoverImage = watch("coverImage", "");
  const watchedLanguage = watch("language", "English");

  const { isValid, isDuplicate, isLoading: checkingIsbn } = useISBNValidation(watchedIsbn, id);

  useEffect(() => {
    if (bookData?.data) {
      const b = bookData.data;
      reset({
        title: b.title,
        isbn: b.isbn,
        language: b.language || "English",
        coverImage: b.coverImage || "",
        description: b.description || "",
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
      toast.error("This ISBN already exists in your library catalog.");
      return;
    }

    if (!data.category) delete data.category;
    if (!data.author) delete data.author;
    if (!data.publisher) delete data.publisher;
    
    updateBook({ id, data }, {
      onSuccess: () => {
        toast.success("Book catalog entry updated successfully!");
        navigate("/books");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to update book");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wider">RETRIEVING BOOK DETAILS...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to="/books" 
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
            >
              <ArrowLeft size={14} className="mr-1" />
              Books Catalog
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Edit Metadata
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={28} />
            Edit Book Catalog Entry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Modify bibliographic metadata, shelf tags, and cover art for this registered title.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/books"
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Live Cover Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Book Title <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    {...register("title", { required: "Title is required" })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {errors.title && <span className="text-rose-500 text-xs mt-1 block">{errors.title.message}</span>}
                </div>

                {/* ISBN */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      ISBN Identifier <span className="text-rose-500">*</span>
                    </label>
                    {watchedIsbn && (
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        {checkingIsbn ? (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Loader2 className="animate-spin" size={12} /> Validating...
                          </span>
                        ) : isDuplicate ? (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                            <AlertCircle size={13} /> Duplicate ISBN
                          </span>
                        ) : isValid === false ? (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                            <XCircle size={13} /> Invalid checksum
                          </span>
                        ) : isValid === true ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 size={13} /> Valid ISBN
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <input 
                    {...register("isbn", { required: "ISBN is required" })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {errors.isbn && <span className="text-rose-500 text-xs mt-1 block">{errors.isbn.message}</span>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    {...register("category")}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">Select Category</option>
                    {categoriesData?.data?.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Author
                  </label>
                  <select 
                    {...register("author")}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">Select Author</option>
                    {authorsData?.data?.map(author => (
                      <option key={author._id} value={author._id}>{author.name}</option>
                    ))}
                  </select>
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Publisher
                  </label>
                  <select 
                    {...register("publisher")}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">Select Publisher</option>
                    {publishersData?.data?.map(pub => (
                      <option key={pub._id} value={pub._id}>{pub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Language
                  </label>
                  <input 
                    {...register("language")}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Cover Image URL
                  </label>
                  <div className="relative">
                    <input 
                      {...register("coverImage")}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <Image className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea 
                    {...register("description")}
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/books"
                className="px-5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>

        {/* Live Book Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-500" />
              Live Visual Preview
            </span>
          </div>

          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg overflow-hidden space-y-4">
            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-900 shadow-inner relative flex items-center justify-center border border-slate-200/60 dark:border-white/10">
              {watchedCoverImage ? (
                <img 
                  src={watchedCoverImage} 
                  alt={watchedTitle || "Book Cover"} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="p-6 text-center text-white/70 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-2xl border border-white/20">
                    📖
                  </div>
                  <h4 className="text-sm font-black text-white px-2 line-clamp-2">
                    {watchedTitle || "Book Title"}
                  </h4>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                {watchedTitle || "Book Title"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ISBN: {watchedIsbn || "N/A"}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default EditBook;
