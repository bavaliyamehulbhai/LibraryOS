import React from "react";
import { useParams, Link } from "react-router-dom";
import { useBook } from "../../hooks/useBooks";
import { 
  ArrowLeft, Edit, BookOpen, Layers, User, 
  Building2, Globe, Calendar, FileText, CheckCircle2, 
  Barcode, Plus, Sparkles, ExternalLink 
} from "lucide-react";

const BookDetails = () => {
  const { id } = useParams();
  const { data: bookData, isLoading, isError } = useBook(id);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wider">LOADING BIBLIOGRAPHIC DOSSIER...</p>
      </div>
    );
  }

  if (isError || !bookData?.data) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Book Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">The requested catalog item could not be retrieved.</p>
        <Link to="/books" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const book = bookData.data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
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
              Bibliographic Dossier
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{book.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
            ISBN: {book.isbn} • {book.category?.name || 'General Category'} • {book.language || 'English'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link 
            to={`/issues/new?bookId=${book._id}`}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <BookOpen size={16} />
            <span>Check-out Title</span>
          </Link>

          <Link 
            to={`/books/edit/${book._id}`} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold border border-slate-200/80 dark:border-slate-700 transition"
          >
            <Edit size={16} />
            <span>Edit Metadata</span>
          </Link>
        </div>
      </div>

      {/* Main Showcase Panel */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12">
        
        {/* Cover Art (4 Cols) */}
        <div className="md:col-span-4 p-8 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-slate-900/50 dark:to-slate-950/50 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800">
          <div className="w-full max-w-[260px] aspect-[3/4.2] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/50 dark:border-white/10 bg-slate-800 flex items-center justify-center relative group">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="p-8 text-center text-white/70 space-y-3">
                <BookOpen size={48} className="mx-auto text-indigo-400" />
                <p className="text-sm font-bold">No Cover Image Available</p>
                <p className="text-xs text-white/50 font-mono">ISBN: {book.isbn}</p>
              </div>
            )}

            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md ${
                book.status === 'AVAILABLE'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}>
                {book.status || 'AVAILABLE'}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center space-y-1">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
              Physical Circulation Copy
            </span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ready for immediate patron checkout
            </div>
          </div>
        </div>

        {/* Book Details Dossier (8 Cols) */}
        <div className="md:col-span-8 p-6 sm:p-8 space-y-6">
          
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {book.category && (
                <Link 
                  to={`/categories/${book.category._id}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
                >
                  {book.category.name}
                </Link>
              )}
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {book.language || 'English'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {book.title}
            </h2>
            {book.subtitle && (
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {book.subtitle}
              </p>
            )}
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                <Barcode size={13} /> ISBN
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                {book.isbn}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                <User size={13} /> Author
              </span>
              {book.author ? (
                <Link to={`/authors/${book.author._id}`} className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  {book.author.name}
                </Link>
              ) : (
                <span className="text-xs text-slate-500">Not specified</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                <Building2 size={13} /> Publisher
              </span>
              {book.publisher ? (
                <Link to={`/publishers/${book.publisher._id}`} className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  {book.publisher.name}
                </Link>
              ) : (
                <span className="text-xs text-slate-500">Not specified</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                <Calendar size={13} /> Year
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {book.publicationYear || 'N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                <FileText size={13} /> Length
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {book.pages ? `${book.pages} pages` : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                <Globe size={13} /> Language
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {book.language || 'English'}
              </span>
            </div>

          </div>

          {/* Synopsis */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Synopsis & Abstract
            </h3>
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {book.description || 'No description or summary registered for this volume.'}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BookDetails;
