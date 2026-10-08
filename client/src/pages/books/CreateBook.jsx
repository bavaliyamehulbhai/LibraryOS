import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useCreateBook } from "../../hooks/useBooks";
import { useCategories } from "../../hooks/useCategories";
import { useAuthors } from "../../hooks/useAuthors";
import { usePublishers } from "../../hooks/usePublishers";
import { useISBNValidation } from "../../hooks/useISBNValidation";
import toast from "react-hot-toast";
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, 
  Loader2, DownloadCloud, BookOpen, Sparkles, Image, 
  Layers, Tag, Globe, FileText, Check 
} from "lucide-react";
import { fetchExternalIsbn } from "../../services/bookService";

const CreateBook = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const { mutate: createBook, isPending } = useCreateBook();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: authorsData } = useAuthors({ limit: 100 });
  const { data: publishersData } = usePublishers({ limit: 100 });
  
  const watchedIsbn = watch("isbn", "");
  const watchedTitle = watch("title", "");
  const watchedAuthor = watch("author", "");
  const watchedCategory = watch("category", "");
  const watchedCoverImage = watch("coverImage", "");
  const watchedLanguage = watch("language", "English");

  const { isValid, isDuplicate, isLoading: checkingIsbn } = useISBNValidation(watchedIsbn);
  const [isFetching, setIsFetching] = React.useState(false);

  const navigate = useNavigate();

  const handleAutoFill = async () => {
    if (!watchedIsbn) {
      toast.error("Please enter an ISBN first");
      return;
    }
    if (isValid === false) {
      toast.error("Please enter a valid ISBN before auto-filling");
      return;
    }

    try {
      setIsFetching(true);
      const res = await fetchExternalIsbn(watchedIsbn);
      if (res.success && res.data) {
        setValue("title", res.data.title || "");
        setValue("description", res.data.description || "");
        setValue("coverImage", res.data.cover || "");
        setValue("pages", res.data.pages || "");
        setValue("language", res.data.language || "English");
        toast.success("Book metadata automatically retrieved & populated!");
      }
    } catch (error) {
      toast.error("Failed to fetch book details from external registry.");
    } finally {
      setIsFetching(false);
    }
  };

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
    if (!data.publicationYear) delete data.publicationYear;
    if (!data.pages) delete data.pages;

    createBook(data, {
      onSuccess: () => {
        toast.success("Book successfully added to catalog!");
        navigate("/books");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to catalog book");
      }
    });
  };

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
              Collection Intake
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={28} />
            Catalog New Book
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Intake physical and digital volumes with instant ISBN auto-enrichment from international databases.
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
                <span>Cataloging...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Publish to Catalog</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Live Cover Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Panel (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Core Metadata Card */}
            <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Core Bibliographic Data</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Title, ISBN identifiers, and smart auto-fill</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Book Title <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    {...register("title", { required: "Title is required" })}
                    placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {errors.title && <span className="text-rose-500 text-xs mt-1 block">{errors.title.message}</span>}
                </div>

                {/* ISBN with Auto-Fill */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      ISBN-10 / ISBN-13 <span className="text-rose-500">*</span>
                    </label>
                    {watchedIsbn && (
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        {checkingIsbn ? (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Loader2 className="animate-spin" size={12} /> Validating...
                          </span>
                        ) : isDuplicate ? (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                            <AlertCircle size={13} /> Duplicate ISBN in library
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
                  <div className="flex gap-2">
                    <input 
                      {...register("isbn", { required: "ISBN is required" })}
                      placeholder="e.g. 9780132350884"
                      className={`flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 transition ${
                        watchedIsbn 
                          ? (isValid === false || isDuplicate 
                              ? "border-rose-500 focus:ring-rose-500/20" 
                              : isValid === true && !isDuplicate 
                              ? "border-emerald-500 focus:ring-emerald-500/20" 
                              : "border-slate-200/80 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500") 
                          : "border-slate-200/80 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      disabled={isFetching || !watchedIsbn}
                      className="px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl transition disabled:opacity-40 flex items-center gap-1.5 text-xs font-bold"
                    >
                      {isFetching ? <Loader2 className="animate-spin" size={15} /> : <DownloadCloud size={15} />}
                      <span>Auto Fetch</span>
                    </button>
                  </div>
                  {errors.isbn && <span className="text-rose-500 text-xs mt-1 block">{errors.isbn.message}</span>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Category / Genre
                  </label>
                  <input 
                    {...register("category")}
                    list="category-options"
                    autoComplete="off"
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  <datalist id="category-options">
                    {categoriesData?.data?.map(cat => (
                      <option key={cat._id} value={cat.name} />
                    ))}
                  </datalist>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Primary Author
                  </label>
                  <input 
                    {...register("author")}
                    list="author-options"
                    autoComplete="off"
                    placeholder="e.g. Robert C. Martin"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  <datalist id="author-options">
                    {authorsData?.data?.map(author => (
                      <option key={author._id} value={author.name} />
                    ))}
                  </datalist>
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Publisher
                  </label>
                  <input 
                    {...register("publisher")}
                    list="publisher-options"
                    autoComplete="off"
                    placeholder="e.g. Prentice Hall"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  <datalist id="publisher-options">
                    {publishersData?.data?.map(pub => (
                      <option key={pub._id} value={pub.name} />
                    ))}
                  </datalist>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Language
                  </label>
                  <input 
                    {...register("language")}
                    defaultValue="English"
                    placeholder="English"
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
                      placeholder="https://images.unsplash.com/... or https://covers.openlibrary.org/..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <Image className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Synopsis & Abstract
                  </label>
                  <textarea 
                    {...register("description")}
                    rows={4}
                    placeholder="Comprehensive overview and summary of this volume..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/books"
                className="px-5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Discard
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isPending ? 'Cataloging Volume...' : 'Save & Publish Book'}
              </button>
            </div>

          </form>
        </div>

        {/* Live Book Showcase Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-500" />
              Live Catalog Card Preview
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Real-time
            </span>
          </div>

          {/* Book Card */}
          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg overflow-hidden space-y-4">
            
            {/* Cover Render */}
            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-900 shadow-inner relative flex items-center justify-center border border-slate-200/60 dark:border-white/10">
              {watchedCoverImage ? (
                <img 
                  src={watchedCoverImage} 
                  alt={watchedTitle || "Book Cover"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="p-6 text-center text-white/70 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-2xl border border-white/20">
                    📖
                  </div>
                  <h4 className="text-sm font-black text-white px-2 line-clamp-2">
                    {watchedTitle || "Book Title"}
                  </h4>
                  <p className="text-xs text-white/60">
                    {watchedAuthor || "Author Name"}
                  </p>
                </div>
              )}

              {/* Status pill in corner */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/90 text-white shadow-md backdrop-blur-md">
                  AVAILABLE
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {watchedCategory || "General"}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {watchedLanguage}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                {watchedTitle || "New Title Preview"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                by <span className="font-semibold text-slate-700 dark:text-slate-300">{watchedAuthor || "Author not specified"}</span>
              </p>

              {/* Simulated barcode */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>ISBN: {watchedIsbn || "978-..."}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase">IN STOCK</span>
              </div>
            </div>

          </div>

          {/* Cataloging Tip Card */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-500" />
              Automated Catalog Enrichment
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Entering a valid ISBN activates our real-time OpenLibrary & Google Books resolver, automatically populating official synopsis, page counts, and publishers.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CreateBook;
