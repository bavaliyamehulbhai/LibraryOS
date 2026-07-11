import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, UploadCloud } from 'lucide-react';

const BrandingSettings = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    libraryName: '',
    companyName: '',
    customDomain: '',
    website: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#1e1b4b'
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        libraryName: initialData.libraryName || '',
        companyName: initialData.companyName || '',
        customDomain: initialData.customDomain || '',
        website: initialData.website || '',
        primaryColor: initialData.primaryColor || '#4f46e5',
        secondaryColor: initialData.secondaryColor || '#1e1b4b'
      });
      setLogo(initialData.logo || null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/v1/settings/branding", formData);
      toast.success("Branding settings saved successfully");
      if (onSave) onSave();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    const toastId = toast.loading("Uploading logo...");
    try {
      const res = await api.post("/v1/settings/logo", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setLogo(res.data.url);
        toast.success("Logo uploaded successfully", { id: toastId });
        if (onSave) onSave();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload logo", { id: toastId });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Library Name</label>
          <input type="text" name="libraryName" value={formData.libraryName} onChange={handleChange} 
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Company / Organization Name</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} 
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Custom Domain</label>
          <input type="text" name="customDomain" value={formData.customDomain} onChange={handleChange} placeholder="library.yourcompany.com" 
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Website URL</label>
          <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com"
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Theme Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} 
                className="h-12 w-16 border-0 p-1 rounded-xl cursor-pointer bg-white dark:bg-gray-700 shadow-sm" />
              <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} 
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} 
                className="h-12 w-16 border-0 p-1 rounded-xl cursor-pointer bg-white dark:bg-gray-700 shadow-sm" />
              <input type="text" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} 
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Upload Library Logo</label>
        <div className="flex items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
          <div className="h-24 w-24 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-inner">
            {logo ? <img src={logo} alt="Logo" className="object-contain h-full w-full p-2" /> : <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">No Logo</span>}
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-xl px-6 py-3 text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 cursor-pointer transition-all">
              <UploadCloud className="w-5 h-5" />
              <span>Choose Image</span>
              <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
            </label>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Recommended size: 256x256px. Max 2MB.</p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Save className="w-5 h-5" />
          {loading ? "Saving..." : "Save Branding Settings"}
        </button>
      </div>
    </form>
  );
};

export default BrandingSettings;
