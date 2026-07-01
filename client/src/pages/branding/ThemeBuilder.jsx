import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeBuilder = () => {
  const [branding, setBranding] = useState({
    brandName: '',
    tagline: '',
    supportEmail: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    dashboardLayout: 'GRID',
    theme: 'LIGHT',
    logo: ''
  });
  
  const [loading, setLoading] = useState(true);
  const { updateBranding: updateContextBranding } = useTheme();

  const fontOptions = ["Inter", "Roboto", "Poppins", "Open Sans", "Montserrat"];
  const layoutOptions = ["GRID", "COMPACT", "EXECUTIVE"];

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await api.get('/branding');
      if (res.data.success && res.data.data) {
        setBranding(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/branding', branding);
      if (res.data.success) {
        toast.success("Theme and Branding updated successfully!");
        updateContextBranding(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save theme');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBranding(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="p-8 text-center">Loading Theme Builder...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theme Builder</h1>
        <p className="text-gray-500 mt-1">Configure advanced branding, typography, layouts, and colors for your tenant.</p>
      </div>

      <form onSubmit={handleSaveBranding} className="space-y-6">
        
        {/* Brand Identity Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <ImageIcon className="w-6 h-6 text-indigo-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Brand Identity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Name</label>
              <input
                type="text"
                name="brandName"
                value={branding.brandName || ''}
                onChange={handleChange}
                placeholder="e.g. GTU Central Library"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={branding.tagline || ''}
                onChange={handleChange}
                placeholder="Knowledge for Everyone"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={branding.supportEmail || ''}
                onChange={handleChange}
                placeholder="support@gtulibrary.ac.in"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Typography & Layout */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Type className="w-6 h-6 text-indigo-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Typography & Layout</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Family</label>
              <select
                name="fontFamily"
                value={branding.fontFamily || 'Inter'}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                style={{ fontFamily: branding.fontFamily }}
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dashboard Layout</label>
              <select
                name="dashboardLayout"
                value={branding.dashboardLayout || 'GRID'}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {layoutOptions.map(layout => (
                  <option key={layout} value={layout}>{layout.charAt(0) + layout.slice(1).toLowerCase()} Layout</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-6 h-6 text-indigo-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Color Palette</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={branding.primaryColor || '#000000'}
                  onChange={handleChange}
                  className="h-10 w-10 p-1 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={branding.primaryColor || ''}
                  onChange={handleChange}
                  className="flex-1 px-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  name="secondaryColor"
                  value={branding.secondaryColor || '#000000'}
                  onChange={handleChange}
                  className="h-10 w-10 p-1 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={branding.secondaryColor || ''}
                  onChange={handleChange}
                  className="flex-1 px-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accent Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  name="accentColor"
                  value={branding.accentColor || '#000000'}
                  onChange={handleChange}
                  className="h-10 w-10 p-1 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="accentColor"
                  value={branding.accentColor || ''}
                  onChange={handleChange}
                  className="flex-1 px-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
          >
            Preview Theme
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            Publish Theme
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThemeBuilder;
