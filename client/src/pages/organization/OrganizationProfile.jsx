import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiMapPin, FiBriefcase, FiImage, FiSettings } from 'react-hot-toast';

const OrganizationProfile = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: {
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      addressLine1: ''
    },
    businessInfo: {
      gstNumber: '',
      establishedYear: ''
    }
  });

  const [branding, setBranding] = useState({
    logo: '',
    primaryColor: '#3B82F6'
  });

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchBranches();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/organizations/profile');
      if (res.data.success && res.data.data) {
        setProfile({ ...profile, ...res.data.data });
        if (res.data.data.branding) setBranding(res.data.data.branding);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/organizations/branches');
      if (res.data.success) {
        setBranches(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load branches');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/organizations/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBrandingSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/organizations/branding', branding);
      toast.success('Branding updated successfully');
    } catch (error) {
      toast.error('Failed to update branding');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading organization data...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Profile</h1>
      </div>

      <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {['basic', 'address', 'business', 'branding', 'branches'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        
        {activeTab === 'basic' && (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Organization Name</label>
                <input 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" 
                  value={profile.name} 
                  onChange={e => setProfile({...profile, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" 
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" 
                  value={profile.phone} 
                  onChange={e => setProfile({...profile, phone: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" 
                  value={profile.website} 
                  onChange={e => setProfile({...profile, website: e.target.value})} 
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">
              {saving ? 'Saving...' : 'Save Basic Info'}
            </button>
          </form>
        )}

        {activeTab === 'branding' && (
          <form onSubmit={handleBrandingSave} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Branding Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL (Cloudinary)</label>
                <input 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" 
                  value={branding.logo || ''} 
                  onChange={e => setBranding({...branding, logo: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    className="p-1 h-10 w-10 border rounded-lg" 
                    value={branding.primaryColor || '#3B82F6'} 
                    onChange={e => setBranding({...branding, primaryColor: e.target.value})} 
                  />
                  <input 
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" 
                    value={branding.primaryColor || '#3B82F6'} 
                    onChange={e => setBranding({...branding, primaryColor: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">
              {saving ? 'Saving...' : 'Save Branding'}
            </button>
          </form>
        )}

        {activeTab === 'branches' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Branch Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add Branch</button>
            </div>
            
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="p-4 font-medium">Branch Code</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {branches.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-gray-500">No branches added yet.</td></tr>
                  ) : (
                    branches.map(branch => (
                      <tr key={branch._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="p-4">{branch.branchCode}</td>
                        <td className="p-4 font-medium">
                          {branch.branchName} 
                          {branch.isHeadOffice && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">HQ</span>}
                        </td>
                        <td className="p-4">{branch.address?.city || 'N/A'}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {branch.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrganizationProfile;
