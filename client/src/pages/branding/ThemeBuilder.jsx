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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-[#0f1117] min-h-[calc(100vh-80px)] transition-colors animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section with Glassmorphism */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Theme Builder
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Configure advanced branding, typography, layouts, and colors for your tenant.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-8">
          
          {/* Brand Identity Section */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl transition-colors">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Brand Identity</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Basic details about your organization.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  value={branding.brandName || ''}
                  onChange={handleChange}
                  placeholder="e.g. GTU Central Library"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                />
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={branding.tagline || ''}
                  onChange={handleChange}
                  placeholder="Knowledge for Everyone"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                />
              </div>
              <div className="md:col-span-2 bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={branding.supportEmail || ''}
                  onChange={handleChange}
                  placeholder="support@gtulibrary.ac.in"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Typography & Layout */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl transition-colors">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Type className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Typography & Layout</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global fonts and page structures.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Font Family</label>
                <select
                  name="fontFamily"
                  value={branding.fontFamily || 'Inter'}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                  style={{ fontFamily: branding.fontFamily }}
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Dashboard Layout</label>
                <select
                  name="dashboardLayout"
                  value={branding.dashboardLayout || 'GRID'}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                >
                  {layoutOptions.map(layout => (
                    <option key={layout} value={layout}>{layout.charAt(0) + layout.slice(1).toLowerCase()} Layout</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl transition-colors">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
              <div className="p-3 bg-rose-50 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Color Palette</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Design the system's look and feel.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    value={branding.primaryColor || '#000000'}
                    onChange={handleChange}
                    className="h-12 w-16 shrink-0 border-0 p-1 rounded-xl cursor-pointer bg-white dark:bg-gray-700 shadow-sm"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={branding.primaryColor || ''}
                    onChange={handleChange}
                    className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium uppercase"
                  />
                </div>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={branding.secondaryColor || '#000000'}
                    onChange={handleChange}
                    className="h-12 w-16 shrink-0 border-0 p-1 rounded-xl cursor-pointer bg-white dark:bg-gray-700 shadow-sm"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={branding.secondaryColor || ''}
                    onChange={handleChange}
                    className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium uppercase"
                  />
                </div>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="accentColor"
                    value={branding.accentColor || '#000000'}
                    onChange={handleChange}
                    className="h-12 w-16 shrink-0 border-0 p-1 rounded-xl cursor-pointer bg-white dark:bg-gray-700 shadow-sm"
                  />
                  <input
                    type="text"
                    name="accentColor"
                    value={branding.accentColor || ''}
                    onChange={handleChange}
                    className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              className="px-8 py-3.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all"
            >
              Preview Theme
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 font-bold transition-all disabled:opacity-50"
            >
              Publish Theme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemeBuilder;
