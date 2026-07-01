import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UploadResearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    authors: '',
    keywords: '',
    publicationYear: new Date().getFullYear(),
    researchType: 'RESEARCH_PAPER',
    doi: '',
    department: '',
    fileUrl: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/v1/research', formData);
      if (res.data.success) {
        toast.success("Research uploaded successfully!");
        navigate('/repository');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">📤 Upload Research</h1>
        <p className="text-gray-500">Publish your paper, thesis, or project to the university repository.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
         
         <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Research Title *</label>
            <input 
               type="text" required name="title" value={formData.title} onChange={handleChange}
               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
               placeholder="Enter the full title of the publication"
            />
         </div>

         <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Abstract *</label>
            <textarea 
               required name="abstract" value={formData.abstract} onChange={handleChange} rows="5"
               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
               placeholder="Paste the abstract here..."
            ></textarea>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Authors *</label>
               <input 
                  type="text" required name="authors" value={formData.authors} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Comma separated (e.g. John Doe, Jane Smith)"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Keywords</label>
               <input 
                  type="text" name="keywords" value={formData.keywords} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Comma separated (e.g. AI, Machine Learning)"
               />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type *</label>
               <select 
                  required name="researchType" value={formData.researchType} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
               >
                  <option value="RESEARCH_PAPER">Research Paper</option>
                  <option value="THESIS">Thesis</option>
                  <option value="DISSERTATION">Dissertation</option>
                  <option value="PROJECT_REPORT">Project Report</option>
                  <option value="CONFERENCE_PAPER">Conference Paper</option>
                  <option value="JOURNAL_ARTICLE">Journal Article</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Year *</label>
               <input 
                  type="number" required name="publicationYear" value={formData.publicationYear} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Department *</label>
               <input 
                  type="text" required name="department" value={formData.department} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Computer Science"
               />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Document URL (PDF) *</label>
               <input 
                  type="url" required name="fileUrl" value={formData.fileUrl} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://drive.google.com/... or similar"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">DOI (Optional)</label>
               <input 
                  type="text" name="doi" value={formData.doi} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="10.1000/xyz123"
               />
            </div>
         </div>

         <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4">
            <button 
               type="button" 
               onClick={() => navigate('/repository')}
               className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
               Cancel
            </button>
            <button 
               type="submit" 
               disabled={loading}
               className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
               {loading ? "Publishing..." : "Publish to Repository"}
            </button>
         </div>
      </form>
    </div>
  );
};

export default UploadResearch;
