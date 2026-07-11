import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, ThumbsUp, ThumbsDown, Clock, Eye, Hash } from 'lucide-react';

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/knowledge/articles/${id}`);
      if (res.data.success) {
        setArticle(res.data.data);
        setStats(res.data.data.stats);
      }
    } catch (error) {
      toast.error('Article not found');
      navigate('/help');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isHelpful) => {
    try {
      const res = await api.post(`/v1/knowledge/articles/${id}/feedback`, { helpful: isHelpful });
      if (res.data.success) {
        setFeedbackSubmitted(true);
        toast.success("Thank you for your feedback!");
      }
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading article...</div>;
  if (!article) return <div className="p-12 text-center text-gray-500">Article not found.</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-12 pb-24 px-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700 -mr-20 -mt-20"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <Link to="/help-center" className="inline-flex items-center text-indigo-100 hover:text-white font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm transition-all hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <div className="flex items-center gap-3 text-sm text-indigo-100 font-medium">
            <span className="bg-white/20 px-3 py-1 rounded-md uppercase tracking-wider text-[10px] font-bold">
              {article.category || 'General'}
            </span>
            <span>•</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date(article.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center bg-indigo-500/50 px-2 py-0.5 rounded-full"><Eye className="w-4 h-4 mr-1" /> {article.views} views</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-sm">
            {article.title}
          </h1>
          
          {article.summary && (
            <p className="text-xl text-indigo-100 font-medium">
              {article.summary}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">
          
          {/* Content (Assuming Markdown or plain text rendered with line breaks) */}
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-lg whitespace-pre-wrap font-sans leading-relaxed">
            {article.content}
          </div>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Widget */}
        <div className="mt-8 text-center space-y-4">
          {!feedbackSubmitted ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Was this article helpful?</h3>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => handleFeedback(true)}
                  className="flex items-center px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 hover:text-green-600 transition-colors shadow-sm"
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Yes
                </button>
                <button 
                  onClick={() => handleFeedback(false)}
                  className="flex items-center px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors shadow-sm"
                >
                  <ThumbsDown className="w-5 h-5 mr-2" />
                  No
                </button>
              </div>
            </>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl inline-block">
              Thank you for your feedback! It helps us improve our support content.
            </div>
          )}
        </div>
        
        {stats && stats.totalVotes > 0 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            {stats.helpfulnessPercentage}% of users found this helpful ({stats.totalVotes} votes)
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetails;
