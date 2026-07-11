import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';

const MyLibrary = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory(1, false);
  }, []);

  const fetchHistory = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await api.get(`/v1/digital-library/my-library?page=${pageNum}&limit=12`);
      if (res.data.success) {
        const newData = res.data.data;
        if (append) {
          setHistory(prev => [...prev, ...newData]);
        } else {
          setHistory(newData);
        }

        if (res.data.pagination) {
          setHasMore(res.data.pagination.page < res.data.pagination.pages);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load reading history");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage, true);
  };

  const removeItem = async (id) => {
    if (!(await confirmAlert("Are you sure you want to remove this from your library?"))) return;
    try {
      const res = await api.delete(`/v1/digital-library/my-library/${id}`);
      if (res.data.success) {
        setHistory(prev => prev.filter(item => item._id !== id));
        toast.success("Removed from library");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-4xl">📚</span> My Digital Content
        </h1>
        <p className="text-gray-500 mt-2">Track your reading progress, resume books, and access saved resources.</p>
      </div>

      {loading && !loadingMore ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">📖</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Content Found</h2>
          <p className="text-gray-500 mb-6">You haven't read or saved any digital resources yet.</p>
          <button 
            onClick={() => navigate('/digital-library')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              item.resourceId && (
                <div 
                  key={item._id} 
                  className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 flex flex-col relative group"
                >
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex justify-center items-center rounded-full bg-white/90 dark:bg-gray-700 text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from Library"
                  >
                    ✕
                  </button>

                  <div className="p-6 border-b border-white/50 dark:border-gray-700 flex gap-4 cursor-pointer" onClick={() => navigate(`/digital-library/${item.resourceId._id}`)}>
                    <div className="h-20 w-16 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/20 rounded shadow flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <ThumbnailImage resource={item.resourceId} />
                    </div>
                    <div className="pr-6">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-blue-600 transition">
                        {item.resourceId.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.resourceId.author}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white/50 dark:bg-gray-900/30 flex-1 flex flex-col">
                    {item.isSaved && item.progress === 0 ? (
                      <div className="mb-4 text-center py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-medium rounded-lg">
                        ⭐ Saved for Later
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Progress</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 shadow-inner">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
                          <span>Page {item.lastPage} of {item.resourceId.totalPages}</span>
                          <span>Last read: {new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}

                    <button 
                      onClick={() => navigate(`/reader/${item.resourceId._id}?page=${item.lastPage || 1}`)}
                      className="mt-auto w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold uppercase tracking-wide text-xs hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex justify-center items-center gap-2 group-hover:from-blue-500 group-hover:to-indigo-500"
                    >
                      <span className="text-sm">📖</span> {item.progress > 0 ? "Resume Reading" : "Start Reading"}
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-bold rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ThumbnailImage = ({ resource }) => {
  const [error, setError] = useState(false);

  if (!resource.coverImage || error) {
    return (
      <svg className="w-8 h-8 text-indigo-400 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  }

  return (
    <img 
      src={resource.coverImage} 
      className="w-full h-full object-cover" 
      onError={() => setError(true)}
    />
  );
};

export default MyLibrary;
