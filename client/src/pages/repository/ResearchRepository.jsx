import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ResearchRepository = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchResearch();
  }, [typeFilter]);

  const fetchResearch = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (typeFilter) query.append("type", typeFilter);
      
      const res = await api.get(`/v1/research?${query.toString()}`);
      if (res.data.success) {
        setPapers(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load research papers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResearch();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">🔬</span> Research Repository
          </h1>
          <p className="text-gray-500 mt-2">Explore academic papers, theses, and student projects.</p>
        </div>
        <Link 
          to="/repository/upload" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>📤</span> Upload Research
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
         <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input 
               type="text" 
               placeholder="Search by title, keyword, abstract..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
            />
            <button type="submit" className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
               Search
            </button>
         </form>

         <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
         >
            <option value="">All Types</option>
            <option value="RESEARCH_PAPER">Research Papers</option>
            <option value="THESIS">Thesis</option>
            <option value="DISSERTATION">Dissertation</option>
            <option value="PROJECT_REPORT">Student Projects</option>
         </select>
      </div>

      {/* Results Grid */}
      {loading ? (
         <div className="flex justify-center p-12"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
      ) : papers.length === 0 ? (
         <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No research found</h3>
            <p className="text-gray-500">Try adjusting your filters or upload a new paper.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map(paper => (
               <Link to={`/repository/${paper._id}`} key={paper._id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                     <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                        {paper.researchType.replace('_', ' ')}
                     </span>
                     <span className="text-xs font-bold text-gray-400">{paper.publicationYear}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                     {paper.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">
                     {paper.abstract}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                     <p className="text-xs text-gray-500 mb-2 truncate">
                        <span className="font-bold">Authors:</span> {paper.authors.join(", ")}
                     </p>
                     <div className="flex justify-between text-xs text-gray-400">
                        <span>🏛️ {paper.department}</span>
                        <span>👁️ {paper.views} views</span>
                     </div>
                  </div>
               </Link>
            ))}
         </div>
      )}

    </div>
  );
};

export default ResearchRepository;
