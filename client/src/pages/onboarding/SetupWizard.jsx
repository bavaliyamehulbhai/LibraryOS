import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [branding, setBranding] = useState({ logo: '', primaryColor: '#3B82F6' });
  const [features, setFeatures] = useState({ whatsapp: false, email: true });

  const steps = [
    { id: 1, title: 'Welcome', description: 'Welcome to LibraryOS SaaS Platform!' },
    { id: 2, title: 'Branding', description: 'Upload your logo and choose a theme color.' },
    { id: 3, title: 'Notifications', description: 'Configure Email & WhatsApp settings.' },
    { id: 4, title: 'Data Import', description: 'Import your existing books & members.' },
  ];

  const handleNext = async () => {
    if (currentStep === 4) {
      setLoading(true);
      try {
        await api.post('/onboarding/step', { stepCompleted: 'SETUP_WIZARD', nextStep: 'COMPLETE' });
        toast.success("Setup completed! Redirecting to Dashboard...");
        navigate('/dashboard');
      } catch (error) {
        toast.error("Failed to complete setup");
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Progress Bar */}
        <div className="bg-gray-100 dark:bg-gray-700 h-2">
          <div 
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {steps[currentStep - 1].description}
            </p>
          </div>

          <div className="min-h-[250px] flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl mb-8 p-6">
            
            {currentStep === 1 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  🚀
                </div>
                <h3 className="text-lg font-medium">Your 14-Day Trial is Active</h3>
                <p className="text-sm text-gray-500 mt-2">We've automatically provisioned your tenant, admin account, and database isolation.</p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="w-full max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL</label>
                  <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="https://res.cloudinary.com/..." value={branding.logo} onChange={e => setBranding({...branding, logo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <input type="color" className="p-1 h-10 w-full rounded-lg" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="w-full max-w-md space-y-4">
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={features.email} onChange={e => setFeatures({...features, email: e.target.checked})} />
                  <span className="ml-3 font-medium">Enable Email Notifications</span>
                </label>
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={features.whatsapp} onChange={e => setFeatures({...features, whatsapp: e.target.checked})} />
                  <span className="ml-3 font-medium">Enable WhatsApp Alerts (Pro Plan)</span>
                </label>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center w-full max-w-md space-y-4">
                 <button className="w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition">
                    Upload Books CSV
                 </button>
                 <button className="w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition">
                    Upload Members CSV
                 </button>
                 <p className="text-xs text-gray-500">You can also skip this and add them later from the dashboard.</p>
              </div>
            )}

          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Back
            </button>
            <button 
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : currentStep === 4 ? 'Finish Setup' : 'Continue'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SetupWizard;
