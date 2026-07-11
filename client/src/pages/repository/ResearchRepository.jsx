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
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">🔬</span> Research Repository
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Explore academic papers, theses, and student projects.</p>
        </div>
        <Link 
          to="/repository/upload" 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <span>📤</span> Upload Research
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 flex flex-col md:flex-row gap-4 relative z-10">
         <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input 
               type="text" 
               placeholder="Search by title, keyword, abstract..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-white/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
            />
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 hover:from-black hover:to-gray-900 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
               Search
            </button>
         </form>

         <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner cursor-pointer"
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
         <div className="text-center py-20 bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">No research found</h3>
            <p className="text-gray-500 font-medium">Try adjusting your filters or upload a new paper.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {papers.map(paper => (
               <Link to={`/repository/${paper._id}`} key={paper._id} className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1.5 flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-4">
                     <span className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm uppercase tracking-wider">
                        {paper.researchType.replace('_', ' ')}
                     </span>
                     <span className="text-xs font-bold text-gray-400">{paper.publicationYear}</span>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                     {paper.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 flex-1 font-medium leading-relaxed">
                     {paper.abstract}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                     <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 truncate font-medium">
                        <span className="font-bold text-gray-900 dark:text-gray-100">Authors:</span> {paper.authors.join(", ")}
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
