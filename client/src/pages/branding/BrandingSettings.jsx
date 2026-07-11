import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Palette, Globe, Upload } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const BrandingSettings = () => {
  const [branding, setBranding] = useState({
    customDomain: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    theme: 'LIGHT',
    logo: ''
  });
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const { updateBranding: updateContextBranding } = useTheme();

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await api.get('/branding');
      if (res.data.success && res.data.data) {
        setBranding(res.data.data);
        if (res.data.data.customDomain) {
          setDomainInput(res.data.data.customDomain);
        }
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
      const res = await api.put('/branding', {
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        theme: branding.theme,
        logo: branding.logo
      });
      if (res.data.success) {
        toast.success("Branding updated successfully!");
        updateContextBranding(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save branding');
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainInput) return;
    setVerifying(true);
    try {
      // 1. Initiate
      await api.post('/branding/domain/initiate', { domain: domainInput });
      
      // 2. Verify
      const res = await api.post('/branding/domain/verify', { domain: domainInput });
      if (res.data.success) {
        toast.success(`Domain ${domainInput} verified successfully!`);
        setBranding({ ...branding, customDomain: domainInput });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
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
                White Label Settings
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Customize LibraryOS to match your organization's brand identity.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Custom Domain Settings */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl transition-colors h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Domain</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide a seamless experience with your own URL.</p>
              </div>
            </div>
            
            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex-grow">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Domain Name</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <input
                  type="text"
                  placeholder="e.g. library.gtu.ac.in"
                  className="flex-1 w-full min-w-0 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                />
                <button
                  onClick={handleVerifyDomain}
                  disabled={verifying || domainInput === branding.customDomain}
                  className="w-full sm:w-auto px-6 py-3 shrink-0 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 shadow-sm transition-colors whitespace-nowrap flex items-center justify-center border border-transparent"
                >
                  {verifying ? 'Verifying...' : branding.customDomain === domainInput ? 'Verified' : 'Verify Domain'}
                </button>
              </div>
              
              {branding.customDomain && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
                  <div>
                    <p className="text-sm font-bold text-green-800 dark:text-green-400">Active Custom Domain</p>
                    <p className="text-sm text-green-700 dark:text-green-500">{branding.customDomain}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme & Colors */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl transition-colors">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Theme & Colors</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set your primary colors and default theme mode.</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveBranding} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                      className="h-12 w-16 shrink-0 border-0 p-1 rounded-xl cursor-pointer bg-white dark:bg-gray-700 shadow-sm"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                      className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium uppercase"
                    />
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                      className="h-12 w-16 shrink-0 border-0 p-1 rounded-xl cursor-pointer bg-white dark:bg-gray-700 shadow-sm"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                      className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium uppercase"
                    />
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Default Theme Mode</label>
                  <select
                    value={branding.theme}
                    onChange={(e) => setBranding({...branding, theme: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                  >
                    <option value="LIGHT">Light</option>
                    <option value="DARK">Dark</option>
                    <option value="SYSTEM">System Settings</option>
                  </select>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Logo URL (or Base64)</label>
                  <input
                    type="text"
                    value={branding.logo || ''}
                    onChange={(e) => setBranding({...branding, logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 font-bold transition-all disabled:opacity-50"
                >
                  Save Branding Options
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;
