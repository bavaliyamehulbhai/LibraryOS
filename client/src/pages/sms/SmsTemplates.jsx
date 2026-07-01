import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  "BOOK_ISSUED", "BOOK_RETURNED", "BOOK_RENEWED", "BOOK_RESERVED", 
  "BOOK_READY", "BOOK_OVERDUE", "BOOK_DUE_REMINDER", "BOOK_DUE_TODAY", "FINE_GENERATED", "FINE_PAID", 
  "MEMBERSHIP_EXPIRING", "ACCOUNT_BLOCKED", "SYSTEM_ANNOUNCEMENT"
];

const SmsTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/v1/sms/templates');
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load SMS templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/v1/sms/templates', editingTemplate);
      toast.success('Template saved successfully');
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template');
    }
  };

  const getTemplateForEvent = (event) => {
    return templates.find(t => t.eventType === event) || {
      eventType: event,
      name: event.replace(/_/g, " ") + " SMS",
      message: `LibraryOS: You have a new notification for your account.`,
      isActive: true
    };
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📝</span> SMS Templates
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Design short text messages for library events (keep under 160 characters).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">SMS Triggers</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[70vh] overflow-y-auto">
              {EVENT_TYPES.map(event => {
                const isConfigured = templates.some(t => t.eventType === event && t.isActive);
                const isSelected = editingTemplate?.eventType === event;
                
                return (
                  <button
                    key={event}
                    onClick={() => setEditingTemplate(getTemplateForEvent(event))}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {event.replace(/_/g, " ")}
                    </span>
                    {isConfigured ? (
                      <span className="h-2 w-2 rounded-full bg-green-500" title="Configured & Active"></span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" title="Not Configured"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            {editingTemplate ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Text: {editingTemplate.name}
                  </h2>
                  <label className="flex items-center cursor-pointer">
                    <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={editingTemplate.isActive}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition ${editingTemplate.isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${editingTemplate.isActive ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>

                <form onSubmit={handleSave}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                      SMS Message
                      <span className={`text-xs font-bold ${editingTemplate.message.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                        {editingTemplate.message.length} / 160 characters
                      </span>
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={editingTemplate.message}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="e.g. LibraryOS: Book {{bookName}} is due tomorrow!"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2">
                      Available vars: {'{{memberName}}'}, {'{{bookName}}'}, {'{{dueDate}}'}, {'{{fineAmount}}'}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="max-w-xs mx-auto border-[8px] border-gray-800 rounded-[2.5rem] p-4 bg-gray-100 dark:bg-gray-900 h-64 relative shadow-xl">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-gray-800 rounded-b-xl"></div>
                      <div className="mt-8 bg-blue-500 text-white rounded-2xl rounded-tr-sm p-3 text-sm shadow-sm ml-8">
                        {editingTemplate.message || "Message preview..."}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(null)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                    >
                      Save Template
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center h-full flex flex-col justify-center items-center">
                <span className="text-6xl mb-4 opacity-50">📱</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select an Event</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                  Choose an event from the left sidebar to edit the SMS template.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsTemplates;
