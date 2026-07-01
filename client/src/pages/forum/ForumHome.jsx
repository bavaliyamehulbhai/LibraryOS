import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ForumHome = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Book Discussions");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/forum/posts?q=${searchQuery}`);
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load forum posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return toast.error("Title and Content are required");
    
    const payload = {
       title: newTitle,
       content: newContent,
       category: newCategory,
       tags: newTags.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      const res = await api.post('/v1/forum/posts', payload);
      if (res.data.success) {
        toast.success("Discussion started! (+10 XP)");
        setShowCreateModal(false);
        setNewTitle("");
        setNewContent("");
        fetchPosts();
      }
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-3xl shadow-lg border border-blue-600 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <span className="text-4xl">🌍</span> Community Forum
           </h1>
           <p className="text-blue-200">Discuss books, ask questions, and share knowledge.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <input 
              type="text" 
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 outline-none focus:border-white w-full md:w-64"
           />
           <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap"
           >
              New Discussion
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         
         {/* Main Feed */}
         <div className="lg:col-span-3 space-y-6">
            {loading ? (
               <div className="flex justify-center p-12">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
               </div>
            ) : posts.length === 0 ? (
               <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500 font-bold">No discussions found.</p>
               </div>
            ) : (
               posts.map(post => (
                  <Link to={`/forum/${post._id}`} key={post._id} className="block bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                     <div className="flex gap-4">
                        {/* Upvotes */}
                        <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl h-fit border border-gray-100 dark:border-gray-700">
                           <span className="text-gray-400 text-sm">▲</span>
                           <span className="font-bold text-gray-900 dark:text-white">{post.upvotes}</span>
                        </div>
                        
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md uppercase tracking-wider">{post.category}</span>
                              <span className="text-xs text-gray-500">Posted by {post.authorId?.name}</span>
                           </div>
                           <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors">{post.title}</h3>
                           <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{post.content}</p>
                           
                           <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                              <span className="flex items-center gap-1">💬 {post.commentsCount} Comments</span>
                              <span className="flex items-center gap-1">👁️ {post.views} Views</span>
                              
                              <div className="flex gap-2 ml-auto">
                                 {post.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">#{tag}</span>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </Link>
               ))
            )}
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="font-black text-gray-900 dark:text-white mb-4">Popular Tags</h3>
               <div className="flex flex-wrap gap-2">
                  {['MERN', 'React', 'AI', 'SystemDesign', 'Research', 'BookReview'].map(tag => (
                     <button key={tag} onClick={() => setSearchQuery(tag)} className="px-3 py-1 bg-gray-50 hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-blue-900/30 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-bold text-xs rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
                        #{tag}
                     </button>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
               <h3 className="font-black text-indigo-900 dark:text-indigo-400 mb-2">Want to earn XP?</h3>
               <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-4">Earn XP and level up your Reading Gamification profile by participating in discussions!</p>
               <ul className="text-sm text-indigo-900 font-bold space-y-2">
                  <li>+10 XP for New Post</li>
                  <li>+5 XP for Comment</li>
                  <li>+2 XP per Upvote</li>
               </ul>
            </div>
         </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
               <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Start a Discussion</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
               </div>
               
               <form onSubmit={handleCreatePost} className="p-8 space-y-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Title</label>
                     <input 
                        type="text" 
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-blue-500"
                        placeholder="e.g. Best resources to learn System Design?"
                        required
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
                        <select 
                           value={newCategory}
                           onChange={e => setNewCategory(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-blue-500"
                        >
                           <option>Book Discussions</option>
                           <option>Study Help</option>
                           <option>Research Topics</option>
                           <option>Library Help</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                        <input 
                           type="text" 
                           value={newTags}
                           onChange={e => setNewTags(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-blue-500"
                           placeholder="react, system-design, etc"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Content</label>
                     <textarea 
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                        className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-blue-500 resize-y"
                        placeholder="Share your thoughts or ask a question..."
                        required
                     ></textarea>
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                     <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                     <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">Post Discussion</button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default ForumHome;
