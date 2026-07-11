import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UploadResource = () => {
  const [uploadMethod, setUploadMethod] = useState('FILE');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    resourceType: 'EBOOK',
    accessLevel: 'MEMBERS_ONLY',
    externalUrl: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadMethod === 'FILE' && !file) {
      return toast.error("Please select a file to upload");
    }
    if (uploadMethod === 'URL' && !formData.externalUrl) {
      return toast.error("Please provide a valid external URL");
    }

    const data = new FormData();
    if (uploadMethod === 'FILE') {
      data.append('file', file);
    }
    
    Object.keys(formData).forEach(key => {
      // If we are using FILE, don't send externalUrl. If URL, don't send file.
      if (uploadMethod === 'FILE' && key === 'externalUrl') return;
      data.append(key, formData[key]);
    });

    setLoading(true);
    setUploadError(null);
    try {
      const res = await api.post('/v1/digital-library/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success("Resource uploaded successfully!");
        navigate('/digital-library');
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Upload failed";
      toast.error(msg);
      if (msg.includes("5MB") || msg.includes("File too large")) {
        setUploadError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back</button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-4xl">📤</span> Upload Digital Resource
        </h1>
        <p className="text-gray-500 mt-2">Add a new PDF, Ebook, or Research Paper to the digital library.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Resource Title</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Author(s)</label>
              <input 
                type="text" 
                name="author"
                required
                value={formData.author}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description / Abstract</label>
            <textarea 
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Resource Type</label>
              <select 
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="EBOOK">E-Book</option>
                <option value="RESEARCH_PAPER">Research Paper</option>
                <option value="JOURNAL">Journal</option>
                <option value="THESIS">Thesis</option>
                <option value="QUESTION_PAPER">Question Paper</option>
                <option value="MAGAZINE">Magazine</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Access Level</label>
              <select 
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">Members Only</option>
                <option value="PREMIUM">Premium</option>
                <option value="STAFF_ONLY">Staff Only</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Storage Method</label>
            <div className="flex gap-6 mb-6">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="uploadMethod" 
                  value="FILE" 
                  checked={uploadMethod === 'FILE'} 
                  onChange={() => setUploadMethod('FILE')} 
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">Direct Upload (Max 5MB)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="uploadMethod" 
                  value="URL" 
                  checked={uploadMethod === 'URL'} 
                  onChange={() => setUploadMethod('URL')} 
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">External Link (Google Drive / AWS)</span>
              </label>
            </div>

            {uploadMethod === 'FILE' ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-900">
                <input 
                  type="file" 
                  accept=".pdf,.epub,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <span className="text-4xl mb-4">📁</span>
                  <span className="text-blue-600 font-bold hover:underline mb-1">Click to browse</span>
                  <span className="text-sm text-gray-500">Max size 5MB</span>
                  {file && <span className="mt-4 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg">Selected: {file.name}</span>}
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Document URL *</label>
                <input 
                  type="url" 
                  name="externalUrl"
                  required={uploadMethod === 'URL'}
                  value={formData.externalUrl}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="https://drive.google.com/... or similar"
                />
              </div>
            )}
          </div>

          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 mb-2 flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h4 className="text-red-800 dark:text-red-400 font-bold mb-1">File Too Large</h4>
                <p className="text-red-700 dark:text-red-300 text-sm mb-3">{uploadError}</p>
                <button 
                  type="button"
                  onClick={() => {
                    setUploadMethod('URL');
                    setUploadError(null);
                  }}
                  className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  Use External Link Instead
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center"
            >
              {loading ? 'Processing...' : 'Publish Resource'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UploadResource;
