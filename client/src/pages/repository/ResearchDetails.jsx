import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ResearchDetails = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [citationLoading, setCitationLoading] = useState(false);
  const [citationFormat, setCitationFormat] = useState("APA");
  const [citation, setCitation] = useState(null);

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      const res = await api.get(`/v1/research/${id}`);
      if (res.data.success) {
        setPaper(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load research details");
    } finally {
      setLoading(false);
    }
  };

  const generateAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.get(`/v1/research/${id}/ai-summary`);
      if (res.data.success) {
        setAiSummary(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to generate AI summary");
    } finally {
      setAiLoading(false);
    }
  };

  const generateCitation = async () => {
    setCitationLoading(true);
    try {
      const res = await api.post(`/v1/research/${id}/citation`, { format: citationFormat });
      if (res.data.success) {
        setCitation(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to generate citation");
    } finally {
      setCitationLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  if (!paper) return <div className="p-12 text-center text-gray-500">Research not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
         <div>
            <Link to="/repository" className="text-sm font-bold text-blue-600 hover:underline mb-2 inline-block">
               ← Back to Repository
            </Link>
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {paper.researchType.replace('_', ' ')}
               </span>
               <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                  {paper.department}
               </span>
               <span className="text-gray-400 font-bold text-sm">{paper.publicationYear}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
               {paper.title}
            </h1>
         </div>
         <a 
            href={paper.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
         >
            <span className="text-xl">📄</span> Read Document
         </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Abstract</h2>
               <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {paper.abstract}
               </p>
            </div>

            {/* Grok AI Assistant Panel */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                     <span className="text-2xl">✨</span> Grok AI Research Assistant
                  </h2>
                  <button 
                     onClick={generateAiSummary}
                     disabled={aiLoading}
                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                     {aiLoading ? "Analyzing..." : "Generate AI Summary"}
                  </button>
               </div>
               
               {aiSummary ? (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-indigo-50 dark:border-indigo-900/30">
                     <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {aiSummary}
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-8 text-indigo-400 dark:text-indigo-500/50 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-2xl">
                     Click "Generate AI Summary" to extract key findings and methodology.
                  </div>
               )}
            </div>

         </div>

         {/* Sidebar Info */}
         <div className="space-y-8">
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4">Authors</h3>
               <div className="flex flex-wrap gap-2 mb-6">
                  {paper.authors.map((author, idx) => (
                     <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-1.5 rounded-lg">
                        {author}
                     </span>
                  ))}
               </div>

               <h3 className="font-bold text-gray-900 dark:text-white mb-4">Keywords</h3>
               <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((kw, idx) => (
                     <span key={idx} className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        #{kw.replace(/\s+/g, '')}
                     </span>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">📝</span> Citation Generator
               </h3>
               
               <div className="flex gap-2 mb-4">
                  <select 
                     value={citationFormat}
                     onChange={(e) => setCitationFormat(e.target.value)}
                     className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none"
                  >
                     <option value="APA">APA 7th</option>
                     <option value="MLA">MLA 9th</option>
                     <option value="IEEE">IEEE</option>
                     <option value="Chicago">Chicago</option>
                  </select>
                  <button 
                     onClick={generateCitation}
                     disabled={citationLoading}
                     className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-sm whitespace-nowrap"
                  >
                     {citationLoading ? "..." : "Generate"}
                  </button>
               </div>

               {citation && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 relative group">
                     {citation}
                     <button 
                        onClick={() => {
                           navigator.clipboard.writeText(citation);
                           toast.success("Citation copied!");
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy to clipboard"
                     >
                        📋
                     </button>
                  </div>
               )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-500">Total Views</span>
                  <span className="font-extrabold text-gray-900 dark:text-white text-lg">{paper.views}</span>
               </div>
               {paper.doi && (
                  <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                     <span className="font-bold text-gray-500">DOI</span>
                     <span className="font-bold text-blue-600 dark:text-blue-400">{paper.doi}</span>
                  </div>
               )}
            </div>

         </div>
      </div>

    </div>
  );
};

export default ResearchDetails;
