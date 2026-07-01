import React, { useState } from 'react';
import api from '../../services/api';

const RulesSettings = () => {
  const [formData, setFormData] = useState({
    finePerDay: 5,
    maxBorrowDays: 14,
    maxBooksPerStudent: 3
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/v1/settings/rules", formData);
      alert("Rules settings saved successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-4 rounded-md mb-6 transition-colors">
        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400">Library Automation Rules</h4>
        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">These rules automatically govern the background jobs calculating fines and managing student quotas.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fine Per Day (Overdue Amount)</label>
        <div className="mt-1 relative rounded-md shadow-sm w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
          </div>
          <input type="number" name="finePerDay" value={formData.finePerDay} onChange={handleChange} className="pl-7 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Borrow Days</label>
        <input type="number" name="maxBorrowDays" value={formData.maxBorrowDays} onChange={handleChange} className="mt-1 block w-full md:w-1/2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Number of days a student can keep a book before it becomes overdue.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Books Per Student</label>
        <input type="number" name="maxBooksPerStudent" value={formData.maxBooksPerStudent} onChange={handleChange} className="mt-1 block w-full md:w-1/2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maximum active borrowed books allowed at the same time.</p>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
          {loading ? "Saving..." : "Save Library Rules"}
        </button>
      </div>
    </form>
  );
};

export default RulesSettings;
