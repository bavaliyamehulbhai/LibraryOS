import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BrandingSettings = () => {
  const [formData, setFormData] = useState({
    libraryName: '',
    companyName: '',
    customDomain: '',
    website: '',
    primaryColor: '#2563eb',
    secondaryColor: '#1e293b'
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  // In a real app, you'd fetch existing settings here via useEffect

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/v1/settings/branding", formData);
      alert("Branding settings saved successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    try {
      const res = await api.post("/v1/settings/logo", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setLogo(res.data.url);
        alert("Logo uploaded successfully");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Library Name</label>
          <input type="text" name="libraryName" value={formData.libraryName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company / Organization Name</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Domain</label>
          <input type="text" name="customDomain" value={formData.customDomain} onChange={handleChange} placeholder="library.yourcompany.com" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
          <input type="url" name="website" value={formData.website} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Theme Color</label>
          <div className="flex items-center mt-1">
            <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
            <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="ml-2 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Theme Color</label>
          <div className="flex items-center mt-1">
            <input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
            <input type="text" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="ml-2 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Library Logo</label>
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
            {logo ? <img src={logo} alt="Logo" className="object-contain h-full w-full" /> : <span className="text-gray-400 dark:text-gray-500 text-xs">No Logo</span>}
          </div>
          <label className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors">
            <span>Change Logo</span>
            <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
          </label>
        </div>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
          {loading ? "Saving..." : "Save Branding Settings"}
        </button>
      </div>
    </form>
  );
};

export default BrandingSettings;
