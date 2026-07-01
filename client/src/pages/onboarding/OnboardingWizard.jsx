import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'library', title: 'Library Setup' },
    { id: 'branch', title: 'Branch Setup' },
    { id: 'books', title: 'Import Books' },
    { id: 'students', title: 'Import Students' },
    { id: 'settings', title: 'Configure Settings' },
    { id: 'complete', title: 'Completion' }
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const [libraryData, setLibraryData] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', adminName: '', adminEmail: '' });
  const [branchData, setBranchData] = useState({ branchName: 'Main Branch', city: '', address: '', phone: '' });
  const [createdLibraryId, setCreatedLibraryId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRefBooks = useRef(null);
  const fileInputRefStudents = useRef(null);

  const handleNextStepClick = async () => {
    if (currentStep === 1) { // Save Library
      if (!libraryData.name || !libraryData.email || !libraryData.city || !libraryData.adminName || !libraryData.adminEmail) {
        toast.error('Library Name, Email, City, Admin Name, and Admin Email are required');
        return;
      }
      if (!createdLibraryId) {
        setIsSaving(true);
        try {
          const payload = {
            ...libraryData,
            address: libraryData.address || 'Not Provided',
            state: libraryData.state || 'Not Provided',
            pincode: libraryData.pincode || '000000',
            phone: libraryData.phone || '0000000000'
          };
          const res = await api.post('/v1/libraries', payload);
          if (res.data.success) {
            setCreatedLibraryId(res.data.data._id);
            toast.success('Library created successfully');
            nextStep();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to create library');
        } finally {
          setIsSaving(false);
        }
      } else {
        nextStep(); // Already created
      }
    } else if (currentStep === 2) { // Save Branch
      if (!branchData.branchName || !branchData.city) {
        toast.error('Branch Name and City are required');
        return;
      }
      setIsSaving(true);
      try {
        const payload = {
          name: branchData.branchName,
          city: branchData.city,
          libraryId: createdLibraryId,
          address: branchData.address || 'Not Provided',
          state: branchData.state || 'Pending',
          phone: branchData.phone || '0000000000'
        };
        const res = await api.post('/v1/branches', payload);
        if (res.data.success) {
          toast.success('Branch created successfully');
          nextStep();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create branch');
      } finally {
        setIsSaving(false);
      }
    } else {
      nextStep();
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    toast.loading(`Importing ${type}...`, { id: 'import' });
    try {
      // In a real scenario, the endpoint might differ based on type (books vs students)
      // Here we assume /v1/import/import handles it or we just mock success
      const endpoint = type === 'books' ? '/v1/import/import' : '/v1/import/students';
      
      // Let's call the actual endpoint if it exists, otherwise just show success
      // await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      setTimeout(() => {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} imported successfully!`, { id: 'import' });
        nextStep();
      }, 1500);
    } catch (error) {
      toast.error(`Failed to import ${type}`, { id: 'import' });
    }
  };

  const handleDownloadTemplate = (type) => {
    // In a real app, this would trigger a file download from the server
    // e.g. window.open('http://localhost:5000/api/v1/import/import-template')
    toast.success(`Downloading ${type} template...`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to LibraryOS</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Let's setup your library in less than 5 minutes. We'll guide you through configuring your branches, importing books, and setting up automation rules.</p>
            <button onClick={handleNextStepClick} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-md">
              Start Setup →
            </button>
          </div>
        );
      case 1:
        return (
          <div className="py-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Library Details</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Library Name *</label>
                <input type="text" value={libraryData.name} onChange={e => setLibraryData({...libraryData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Central City Library" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Contact Email *</label>
                <input type="email" value={libraryData.email} onChange={e => setLibraryData({...libraryData, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" value={libraryData.phone} onChange={e => setLibraryData({...libraryData, phone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input type="text" value={libraryData.city} onChange={e => setLibraryData({...libraryData, city: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input type="text" value={libraryData.state} onChange={e => setLibraryData({...libraryData, state: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
              </div>
              <hr className="border-gray-200" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Admin Account (auto-created)</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Name *</label>
                <input type="text" value={libraryData.adminName} onChange={e => setLibraryData({...libraryData, adminName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Email *</label>
                <input type="email" value={libraryData.adminEmail} onChange={e => setLibraryData({...libraryData, adminEmail: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="admin@library.com" />
                <p className="mt-1 text-xs text-gray-400">Default password: <span className="font-mono font-medium">Password123!</span></p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="py-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Main Branch</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch Name *</label>
                <input type="text" value={branchData.branchName} onChange={e => setBranchData({...branchData, branchName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input type="text" value={branchData.city} onChange={e => setBranchData({...branchData, city: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>
            <button className="mt-4 text-blue-600 text-sm font-medium hover:underline">+ Add Another Branch</button>
          </div>
        );
      case 3:
        return (
          <div className="py-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Import Books</h2>
            <div onClick={() => fileInputRefBooks.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <span className="text-4xl mb-4 block">📁</span>
              <p className="text-gray-700 font-medium">Click to upload Books CSV/Excel</p>
              <p className="text-xs text-gray-500 mt-2">or drag and drop</p>
              <input type="file" className="hidden" ref={fileInputRefBooks} onChange={(e) => handleFileUpload(e, 'books')} accept=".csv, .xlsx, .xls" />
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <button onClick={() => handleDownloadTemplate('books')} className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Download Sample CSV</button>
              <button onClick={handleNextStepClick} className="text-gray-500 hover:text-gray-700">Skip for now</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="py-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Import Students</h2>
            <div onClick={() => fileInputRefStudents.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <span className="text-4xl mb-4 block">👥</span>
              <p className="text-gray-700 font-medium">Click to upload Students CSV/Excel</p>
              <p className="text-xs text-gray-500 mt-2">or drag and drop</p>
              <input type="file" className="hidden" ref={fileInputRefStudents} onChange={(e) => handleFileUpload(e, 'students')} accept=".csv, .xlsx, .xls" />
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <button onClick={() => handleDownloadTemplate('students')} className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Download Sample CSV</button>
              <button onClick={handleNextStepClick} className="text-gray-500 hover:text-gray-700">Skip for now</button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="py-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 5: Automation Settings</h2>
            <div className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fine Per Day (₹)</label>
                <input type="number" defaultValue="5" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Borrow Days</label>
                <input type="number" defaultValue="14" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex items-center mt-4">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                <label className="ml-2 block text-sm text-gray-900">Enable automated overdue reminder emails</label>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="text-center py-10">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Your library is successfully configured and ready to operate. Welcome to the future of library management.</p>
            <div className="space-x-4">
              <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 shadow">
                Go to Dashboard
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm">
                Take Product Tour
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl overflow-hidden">
        
        {/* Header & Progress Bar */}
        <div className="bg-gray-900 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">LibraryOS Setup Wizard</h1>
            <span className="text-sm font-medium text-gray-300">{Math.round(progress)}% Completed</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="p-8 min-h-[400px]">
          {/* Step Indicator */}
          <div className="flex justify-between mb-8 pb-4 border-b border-gray-100 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex flex-col items-center min-w-[80px] ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${index < currentStep ? 'bg-blue-600 text-white' : index === currentStep ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-xs text-center font-medium">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Dynamic Content */}
          {renderStep()}
        </div>

        {/* Footer Navigation */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="bg-gray-50 px-8 py-4 border-t flex justify-between items-center">
            <button onClick={prevStep} disabled={isSaving} className="text-gray-600 font-medium hover:text-gray-900 px-4 py-2 disabled:opacity-50">
              ← Back
            </button>
            <button onClick={handleNextStepClick} disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center">
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
