import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, Plus, Book, FileText, 
  GraduationCap, Newspaper, LayoutGrid, List, Sparkles, 
  ArrowRight, Eye, ShieldCheck, Download
} from 'lucide-react';

const DigitalLibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  
  // Pagination & Categories
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  
  const resourceTypes = [
    { id: "", name: "All Formats", icon: BookOpen },
    { id: "EBOOK", name: "E-Books", icon: Book },
    { id: "RESEARCH_PAPER", name: "Research Papers", icon: FileText },
    { id: "JOURNAL", name: "Journals", icon: BookOpen },
    { id: "THESIS", name: "Theses", icon: GraduationCap },
    { id: "QUESTION_PAPER", name: "Question Papers", icon: FileText },
    { id: "MAGAZINE", name: "Magazines", icon: Newspaper }
  ];

  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  const fetchResources = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      let url = `/v1/digital-library?page=${pageNum}&limit=12&search=${encodeURIComponent(search)}`;
      if (selectedType) {
        url += `&resourceType=${selectedType}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        const newResources = res.data.data;
        if (append) {
          setResources(prev => [...prev, ...newResources]);
        } else {
          setResources(newResources);
        }
        
        if (res.data.pagination) {
          setHasMore(res.data.pagination.page < res.data.pagination.pages);
          setTotalCount(res.data.pagination.total || newResources.length);
        } else {
          setHasMore(false);
          setTotalCount(newResources.length);
        }
      }
    } catch (error) {
      toast.error("Failed to load digital resources");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchResources(1, false);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedType]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResources(nextPage, true);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Digital Library
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  Cloud E-Reader
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Instant streaming and interactive reading for e-books, journals, and papers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/digital-library/my-library')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>My Reading Shelf</span>
            </button>

            {user && ['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN'].includes(user.role) && (
              <button 
                onClick={() => navigate('/digital-library/upload')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Catalogued Assets</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-baseline gap-2">
            {totalCount || resources.length}
            <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">Available</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Interactive Reader</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>AI Copilot</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Supported Streams</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">PDF</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">EPUB</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">HTML5</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Access Protocol</div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-DRM Friction</span>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {resourceTypes.map(type => {
          const Icon = type.icon;
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id || 'all'}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{type.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Search by Title, Author, Keyword, or Topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-10 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all shadow-sm"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content Rendering */}
      {loading && !loadingMore ? (
        <div className="flex flex-col items-center justify-center p-20">
          <div className="w-10 h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading digital library index...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            📂
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Resources Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {search ? `No results match "${search}". Try adjusting your keywords or format filters.` : 'Your digital shelf currently has no documents uploaded.'}
          </p>
          {user && ['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN'].includes(user.role) && (
            <button
              onClick={() => navigate('/digital-library/upload')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 transition"
            >
              <Plus className="w-4 h-4" />
              Upload First Document
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <div 
                key={resource._id} 
                className="group relative flex flex-col rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/digital-library/${resource._id}`)}
              >
                {/* Cover Preview */}
                <div className="h-52 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center relative overflow-hidden border-b border-slate-100 dark:border-white/5">
                  <ResourceImage resource={resource} />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
                      {resource.resourceType || 'DOC'}
                    </span>
                    {resource.accessLevel && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md ${
                        resource.accessLevel === 'PUBLIC'
                          ? 'bg-emerald-500/80 text-white'
                          : 'bg-indigo-500/80 text-white'
                      }`}>
                        {resource.accessLevel}
                      </span>
                    )}
                  </div>

                  {/* Read Quick Button Overlay */}
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reader/${resource._id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 shadow-md shadow-blue-500/30 transition transform hover:scale-105"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Online</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {resource.author || 'Unknown Author'}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{resource.totalPages || '--'} Pages</span>
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700/60 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore ? "Loading More..." : "Load More Resources"}
              </button>
            </div>
          )}
        </>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Title & Author</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Access Tier</th>
                  <th className="px-4 py-3.5">Pages</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {resources.map((resource) => (
                  <tr 
                    key={resource._id}
                    className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/digital-library/${resource._id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{resource.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{resource.author || 'Unknown'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {resource.resourceType || 'DOCUMENT'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        resource.accessLevel === 'PUBLIC'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      }`}>
                        {resource.accessLevel || 'MEMBER'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono">
                      {resource.totalPages || '--'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/reader/${resource._id}`)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold transition"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => navigate(`/digital-library/${resource._id}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ResourceImage = ({ resource }) => {
  const [error, setError] = useState(false);

  if (!resource.coverImage || error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-900 text-blue-600 dark:text-blue-400">
        <BookOpen className="w-10 h-10 opacity-70 mb-2" />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          LibraryOS Stream
        </span>
      </div>
    );
  }

  return (
    <img 
      src={resource.coverImage} 
      alt={resource.title} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
};

export default DigitalLibrary;
