import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const ResourceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userRole = user?.role || (user?.roleId?.name);
  const isAdmin = ["SUPER_ADMIN", "LIBRARY_ADMIN"].includes(userRole);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/v1/digital-library/${id}`);
        if (res.data.success) {
          setResource(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load resource details");
        navigate('/digital-library');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, navigate]);

  const handleRead = async () => {
    // Basic mock of a reading interaction. We'll update reading progress.
    try {
      await api.post('/v1/digital-library/progress', {
        resourceId: id,
        lastPage: 1
      });
      navigate(`/reader/${id}`);
    } catch (error) {
      toast.error("Failed to open resource");
    }
  };

  if (loading) {
    return <div className="p-20 text-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div>;
  }

  const handleSaveForLater = async () => {
    try {
      const res = await api.post(`/v1/digital-library/${id}/save`);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to save for later";
      console.error("Save for later error:", error.response || error);
      toast.error(`Error: ${errorMsg}`);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/v1/digital-library/${id}`);
      if (res.data.success) {
        toast.success("Resource deleted successfully");
        navigate('/digital-library');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete resource");
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <button onClick={() => navigate('/digital-library')} className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Library</button>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
        
        {/* Cover Section */}
        <div className="md:w-1/3 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/20 flex items-center justify-center p-12 border-r border-gray-100 dark:border-gray-700 relative">
          {resource.coverImage && !imageError ? (
            <img src={resource.coverImage} className="w-full h-full object-cover absolute inset-0 opacity-20 blur-sm" onError={() => setImageError(true)} />
          ) : null}
          <div className="text-center relative z-10">
             {resource.coverImage && !imageError ? (
                <img src={resource.coverImage} className="max-h-64 rounded-lg shadow-2xl mb-6 mx-auto" onError={() => setImageError(true)} />
             ) : (
                <span className="text-8xl mb-6 shadow-xl rounded-xl bg-white dark:bg-gray-800 p-8 inline-block">
                  {resource.resourceType === 'PDF' || resource.resourceType === 'EBOOK' ? '📄' : '📚'}
                </span>
             )}
             <div className="mt-4 inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-3 py-1 rounded-full text-sm">
               {resource.resourceType}
             </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="md:w-2/3 p-10 flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">By {resource.author}</p>
          
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description / Abstract</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {resource.description || "No description available for this resource."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="block text-gray-500 mb-1">Total Pages</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                {resource.totalPages || (resource.fileUrl?.startsWith('http') && !resource.fileUrl.includes('cloudinary') ? "N/A (External)" : "Unknown")}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="block text-gray-500 mb-1">Access Level</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">{resource.accessLevel}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="block text-gray-500 mb-1">
                {resource.fileUrl?.startsWith('http') && !resource.fileUrl.includes('cloudinary') ? "Storage" : "File Size"}
              </span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                {resource.fileUrl?.startsWith('http') && !resource.fileUrl.includes('cloudinary') 
                  ? "External Link" 
                  : (resource.fileSize ? `${(resource.fileSize / (1024 * 1024)).toFixed(2)} MB` : "Unknown")}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="block text-gray-500 mb-1">Uploaded On</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-auto flex gap-4">
            <button 
              onClick={handleRead}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md shadow-blue-500/30 text-lg flex justify-center items-center"
            >
              <span className="mr-2">📖</span> Read Online
            </button>
            <button onClick={handleSaveForLater} className="px-6 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-gray-700 hover:text-yellow-600 transition flex justify-center items-center" title="Save for Later">
              <span className="text-xl">⭐</span>
            </button>
            {isAdmin && (
              <button onClick={() => setShowDeleteConfirm(true)} className="px-6 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold py-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition flex justify-center items-center" title="Delete Resource">
                <span className="text-xl">🗑️</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Beautiful Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ⚠️
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Delete Resource?</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Are you absolutely sure you want to permanently delete <strong className="text-gray-700 dark:text-gray-300">{resource.title}</strong>? This action cannot be undone and will remove it from all users' reading history.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/30 transition-all hover:-translate-y-0.5"
              >
                Yes, Delete it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResourceDetails;
