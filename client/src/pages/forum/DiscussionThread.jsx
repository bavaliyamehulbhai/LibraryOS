import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DiscussionThread = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchThread();
  }, [id]);

  const fetchThread = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/forum/posts/${id}`);
      if (res.data.success) {
        setPost(res.data.data.post);
        setComments(res.data.data.comments);
      }
    } catch (error) {
      toast.error("Failed to load thread");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const res = await api.post(`/v1/forum/posts/${id}/upvote`);
      if (res.data.success) {
         toast.success("Upvoted! (+2 XP to author)");
         setPost(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to upvote");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment) return toast.error("Comment cannot be empty");

    try {
      const res = await api.post(`/v1/forum/posts/${id}/comments`, { content: newComment });
      if (res.data.success) {
        toast.success("Comment added! (+5 XP)");
        setNewComment("");
        fetchThread();
      }
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  if (!post) return <div className="p-8 text-center text-gray-500">Post not found</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Back Button */}
      <Link to="/forum" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
         <span>←</span> Back to Forum
      </Link>

      {/* Main Post */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex">
         {/* Upvote Gutter */}
         <div className="w-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col items-center pt-8 gap-4">
            <button onClick={handleUpvote} className="text-2xl text-gray-400 hover:text-blue-600 transition-colors transform hover:-translate-y-1">▲</button>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{post.upvotes}</span>
         </div>
         
         <div className="p-8 flex-1">
            <div className="flex items-center gap-2 mb-4">
               <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md uppercase tracking-wider">{post.category}</span>
               <span className="text-xs text-gray-500">Posted by <span className="font-bold">{post.authorId?.name}</span> • {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">{post.title}</h1>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">{post.content}</p>
            
            <div className="flex gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
               {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold">#{tag}</span>
               ))}
            </div>
         </div>
      </div>

      {/* Comments Section */}
      <div className="pl-0 md:pl-20 space-y-6">
         <h3 className="text-xl font-black text-gray-900 dark:text-white">{post.commentsCount} Comments</h3>

         {/* Add Comment */}
         <form onSubmit={handleAddComment} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <textarea 
               value={newComment}
               onChange={e => setNewComment(e.target.value)}
               className="w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none mb-4"
               placeholder="Add a comment... (+5 XP)"
            ></textarea>
            <div className="flex justify-end">
               <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">Post Comment</button>
            </div>
         </form>

         {/* Comment List */}
         <div className="space-y-4">
            {comments.map(comment => (
               <div key={comment._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                           {comment.authorId?.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{comment.authorId?.name}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default DiscussionThread;
