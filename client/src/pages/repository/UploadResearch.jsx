import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Plus, Trash2 } from 'lucide-react';

const UploadResearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingDoi, setFetchingDoi] = useState(false);
  const [fetchDoiValue, setFetchDoiValue] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    authors: '',
    keywords: '',
    publicationYear: new Date().getFullYear(),
    researchType: 'RESEARCH_PAPER',
    doi: '',
    department: '',
    publisher: '',
    fileUrl: '',
    externalLinks: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFetchCrossref = async () => {
    if (!fetchDoiValue.trim()) {
      toast.error("Please enter a DOI");
      return;
    }
    setFetchingDoi(true);
    try {
      const res = await api.post('/v1/academic/crossref', { doi: fetchDoiValue.trim() });
      if (res.data.success) {
        const data = res.data.data;
        setFormData({
          ...formData,
          title: data.title || formData.title,
          abstract: data.abstract || formData.abstract,
          authors: data.authors ? data.authors.join(', ') : formData.authors,
          publicationYear: data.publicationYear || formData.publicationYear,
          publisher: data.publisher || formData.publisher,
          keywords: data.keywords ? data.keywords.join(', ') : formData.keywords,
          doi: data.doi || formData.doi
        });
        toast.success("Academic metadata fetched successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch metadata from Crossref");
    } finally {
      setFetchingDoi(false);
    }
  };

  const addExternalLink = () => {
    setFormData({
      ...formData,
      externalLinks: [...formData.externalLinks, { platform: '', url: '' }]
    });
  };

  const removeExternalLink = (index) => {
    const newLinks = [...formData.externalLinks];
    newLinks.splice(index, 1);
    setFormData({ ...formData, externalLinks: newLinks });
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...formData.externalLinks];
    newLinks[index][field] = value;
    setFormData({ ...formData, externalLinks: newLinks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Filter out empty external links
    const cleanedLinks = formData.externalLinks.filter(l => l.platform.trim() && l.url.trim());
    const dataToSubmit = { ...formData, externalLinks: cleanedLinks };

    try {
      const res = await api.post('/v1/research', dataToSubmit);
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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">📤 Upload Research</h1>
        <p className="text-gray-500">Publish your paper, thesis, or project to the university repository.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800">
        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">⚡ Auto-Fetch Data (Crossref API)</h3>
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">Paste the DOI of your research paper to automatically fill the form.</p>
        <div className="flex gap-4">
          <input 
            type="text" value={fetchDoiValue} onChange={(e) => setFetchDoiValue(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500"
            placeholder="e.g. 10.1038/s41586-020-2649-2"
          />
          <button 
            type="button"
            onClick={handleFetchCrossref}
            disabled={fetchingDoi}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-70 transition-all shadow-sm"
          >
            <Search className="w-5 h-5" />
            {fetchingDoi ? "Fetching..." : "Fetch Metadata"}
          </button>
        </div>
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

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Document URL (PDF) *</label>
               <input 
                  type="url" required name="fileUrl" value={formData.fileUrl} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://drive.google.com/..."
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
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Publisher (Optional)</label>
               <input 
                  type="text" name="publisher" value={formData.publisher} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. IEEE, Springer"
               />
            </div>
         </div>

         {/* External Links Section */}
         <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">External Links & LMS (Optional)</label>
              <button 
                type="button" onClick={addExternalLink}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.externalLinks.map((link, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input 
                      type="text" value={link.platform} onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                      placeholder="Platform (e.g. Canvas, Moodle, GitHub)"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-[2]">
                    <input 
                      type="url" value={link.url} onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <button 
                    type="button" onClick={() => removeExternalLink(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.externalLinks.length === 0 && (
                <p className="text-sm text-gray-400 italic">No external links added yet.</p>
              )}
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
