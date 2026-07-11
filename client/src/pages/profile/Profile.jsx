import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setFormData({ name: user?.name || user?.firstName + ' ' + user?.lastName || '', email: user?.email || '' });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/v1/auth/profile', formData);
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Profile Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          
          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="absolute -top-12 left-8 h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-400 text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0) || "U"}
            </div>
            
            <div className="pt-16 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name || 'Admin User'}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user?.role || (user?.roleId?.name) || 'Super Admin'}</p>
              </div>
              <button 
                onClick={isEditing ? () => setIsEditing(false) : startEditing}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Personal Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white font-medium">{user?.name || user?.firstName + ' ' + user?.lastName || 'Admin User'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white font-medium">{user?.email || 'admin@libraryos.com'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Security</h3>
                  
                  <div className="space-y-4">
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Change Password</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
