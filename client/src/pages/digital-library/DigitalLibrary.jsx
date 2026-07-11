import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DigitalLibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  
  // Pagination & Categories
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  // Resource Type Filter
  const [selectedType, setSelectedType] = useState("");
  
  const resourceTypes = [
    { id: "EBOOK", name: "E-Book" },
    { id: "RESEARCH_PAPER", name: "Research Paper" },
    { id: "JOURNAL", name: "Journal" },
    { id: "THESIS", name: "Thesis" },
    { id: "QUESTION_PAPER", name: "Question Paper" },
    { id: "MAGAZINE", name: "Magazine" }
  ];

  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  const fetchResources = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      let url = `/v1/digital-library?page=${pageNum}&limit=12&search=${search}`;
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
        } else {
          setHasMore(false);
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
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedType]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResources(nextPage, true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">📱</span> Digital Library
          </h1>
          <p className="text-gray-500 mt-2">Browse and read E-Books, Research Papers, and Journals online.</p>
        </div>
        <div className="flex gap-4">
          {user && ['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN'].includes(user.role) && (
            <button 
              onClick={() => navigate('/digital-library/upload')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition shadow-md"
            >
              + Upload Resource
            </button>
          )}
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-2xl relative z-10">
        <input 
          type="text" 
          placeholder="Search by Title, Author, or Keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-4 bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none transition-shadow focus:shadow-xl focus:shadow-blue-500/20"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-4 bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none cursor-pointer"
        >
          <option value="">All Resource Types</option>
          {resourceTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      {loading && !loadingMore ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-12 text-center rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 relative z-10">
          <div className="text-6xl mb-4 opacity-50">📂</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Resources Found</h2>
          <p className="text-gray-500">There are currently no digital resources available for this criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
            {resources.map((resource) => (
              <div 
                key={resource._id} 
                className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl border border-white/50 dark:border-gray-700/50 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/40 hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-black/60 hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col h-full"
                onClick={() => navigate(`/digital-library/${resource._id}`)}
              >
                <div className="h-48 bg-gradient-to-br from-indigo-100/50 to-blue-50/50 dark:from-indigo-900/40 dark:to-blue-900/20 flex flex-col justify-center items-center text-center p-0 border-b border-white/50 dark:border-gray-700/50 group-hover:bg-blue-50/80 dark:group-hover:bg-blue-900/30 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <ResourceImage resource={resource} />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{resource.author}</p>
                  <div className="mt-auto flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center">
                      <span className="mr-1">📄</span> {resource.totalPages} Pages
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                      {resource.accessLevel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-bold rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More Resources"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ResourceImage = ({ resource }) => {
  const [error, setError] = useState(false);

  if (!resource.coverImage || error) {
    return (
      <>
        <span className="text-5xl mb-3 shadow-sm rounded bg-white dark:bg-gray-800 p-3">
          {resource.resourceType === 'PDF' || resource.resourceType === 'EBOOK' ? '📄' : '📚'}
        </span>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded absolute bottom-4">
          {resource.resourceType}
        </span>
      </>
    );
  }

  return (
    <>
      <img 
        src={resource.coverImage} 
        alt={resource.title} 
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
      <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded absolute bottom-2 right-2 backdrop-blur-sm">
        {resource.resourceType}
      </span>
    </>
  );
};

export default DigitalLibrary;
