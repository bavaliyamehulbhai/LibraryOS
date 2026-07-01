import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DigitalLibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/v1/digital-library?search=${search}`);
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load digital resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResources();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="flex justify-between items-center mb-8">
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

      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search by Title, Author, or Keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">📂</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Resources Found</h2>
          <p className="text-gray-500">There are currently no digital resources available in the library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <div 
              key={resource._id} 
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer group flex flex-col h-full"
              onClick={() => navigate(`/digital-library/${resource._id}`)}
            >
              <div className="h-48 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/20 flex flex-col justify-center items-center text-center p-0 border-b border-gray-100 dark:border-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition relative overflow-hidden">
                {resource.coverImage ? (
                  <img src={resource.coverImage} alt={resource.title} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-5xl mb-3 shadow-sm rounded bg-white dark:bg-gray-800 p-3">
                      {resource.resourceType === 'PDF' || resource.resourceType === 'EBOOK' ? '📄' : '📚'}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded absolute bottom-4">
                      {resource.resourceType}
                    </span>
                  </>
                )}
                {resource.coverImage && (
                  <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded absolute bottom-2 right-2 backdrop-blur-sm">
                    {resource.resourceType}
                  </span>
                )}
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
      )}
    </div>
  );
};

export default DigitalLibrary;
