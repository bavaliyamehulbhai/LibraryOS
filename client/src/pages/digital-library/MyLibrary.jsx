import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const MyLibrary = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/v1/digital-library/my-library');
        if (res.data.success) {
          setHistory(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load reading history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-4xl">📚</span> My Digital Content
        </h1>
        <p className="text-gray-500 mt-2">Track your reading progress, resume books, and access saved resources.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">📖</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Reading History</h2>
          <p className="text-gray-500 mb-6">You haven't read any digital resources yet.</p>
          <button 
            onClick={() => navigate('/digital-library')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Continue Reading</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              item.resourceId && (
                <div 
                  key={item._id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex gap-4">
                    <div className="h-20 w-16 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/20 rounded shadow flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {item.resourceId.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{item.resourceId.author}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/30 flex-1 flex flex-col">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Progress</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-6">
                      <span>Page {item.lastPage} of {item.resourceId.totalPages}</span>
                      <span>Last read: {new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <button 
                      onClick={() => navigate(`/digital-library/${item.resourceId._id}`)}
                      className="mt-auto w-full py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                    >
                      Resume Reading
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
