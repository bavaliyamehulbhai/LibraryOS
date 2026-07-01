import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Book, HelpCircle, FileText, ChevronRight } from 'lucide-react';

const HelpCenter = () => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!searchQuery) {
        const catRes = await api.get('/v1/help/categories');
        setCategories(catRes.data.data);
      }
      
      const artRes = await api.get(`/v1/help/articles${searchQuery ? `?q=${searchQuery}` : ''}`);
      setArticles(artRes.data.data);
    } catch (error) {
      console.error('Failed to load help center data', error);
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName) => {
    switch(iconName) {
      case 'book': return <Book className="w-6 h-6 text-indigo-500" />;
      case 'file-text': return <FileText className="w-6 h-6 text-indigo-500" />;
      default: return <HelpCircle className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Search Section */}
      <div className="bg-indigo-600 dark:bg-indigo-900 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold">How can we help you today?</h1>
          <p className="text-indigo-100 text-lg">Search our knowledge base for answers to common questions.</p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for articles, guides, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-xl text-gray-900 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-lg text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading help center...</div>
        ) : searchQuery ? (
          /* Search Results */
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {articles.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <HelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search terms or browse categories below.</p>
              </div>
            ) : (
              articles.map(article => (
                <Link 
                  key={article._id} 
                  to={`/help/article/${article.slug}`}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-colors"
                >
                  <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{article.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{article.summary || article.content}</p>
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {article.categoryId?.name}
                    </span>
                    <span>•</span>
                    <span>{article.views} views</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          /* Categories & Popular Articles (No Search) */
          <div className="space-y-16">
            {/* Categories Grid */}
            {categories.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(category => (
                    <div 
                      key={category._id} 
                      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                        {renderIcon(category.icon)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                      <p className="text-gray-500 text-sm">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Articles */}
            {articles.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Popular Articles</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {articles.slice(0, 5).map(article => (
                    <Link 
                      key={article._id}
                      to={`/help/article/${article.slug}`}
                      className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{article.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{article.categoryId?.name}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
