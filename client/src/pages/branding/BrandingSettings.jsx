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

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">White Label Settings</h1>
        <p className="text-gray-500 mt-1">Customize LibraryOS to match your organization's brand.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Globe className="w-6 h-6 text-indigo-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Domain</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Connect your own domain to provide a seamless experience to your users.</p>
        
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="e.g. library.gtu.ac.in"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
          />
          <button
            onClick={handleVerifyDomain}
            disabled={verifying || domainInput === branding.customDomain}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {verifying ? 'Verifying...' : branding.customDomain === domainInput ? 'Verified' : 'Verify Domain'}
          </button>
        </div>
        {branding.customDomain && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            ✓ Active Custom Domain: {branding.customDomain}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Palette className="w-6 h-6 text-indigo-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Theme & Colors</h2>
        </div>
        
        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                  className="h-10 w-10 p-1 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                  className="flex-1 px-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                  className="h-10 w-10 p-1 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                  className="flex-1 px-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Theme</label>
              <select
                value={branding.theme}
                onChange={(e) => setBranding({...branding, theme: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="LIGHT">Light</option>
                <option value="DARK">Dark</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo URL (or Base64)</label>
              <input
                type="text"
                value={branding.logo || ''}
                onChange={(e) => setBranding({...branding, logo: e.target.value})}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              Save Branding
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default BrandingSettings;
