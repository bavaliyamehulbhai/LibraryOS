import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  "BOOK_ISSUED", "BOOK_RETURNED", "BOOK_RENEWED", "BOOK_RESERVED", 
  "BOOK_READY", "BOOK_OVERDUE", "BOOK_DUE_REMINDER", "BOOK_DUE_TODAY", "FINE_GENERATED", "FINE_PAID", 
  "MEMBERSHIP_EXPIRING", "ACCOUNT_BLOCKED", "SYSTEM_ANNOUNCEMENT"
];

const WhatsAppTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/v1/whatsapp/templates');
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load WhatsApp templates');
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
      await api.put('/v1/whatsapp/templates', editingTemplate);
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
      name: event.replace(/_/g, " ") + " WhatsApp",
      message: `Hello {{memberName}},\n\nYou have a new notification from LibraryOS.`,
      interactiveButtons: [],
      isActive: true
    };
  };

  const addInteractiveButton = () => {
    if (editingTemplate.interactiveButtons.length >= 3) {
      toast.error('Maximum 3 interactive buttons allowed by Meta.');
      return;
    }
    setEditingTemplate({
      ...editingTemplate,
      interactiveButtons: [...editingTemplate.interactiveButtons, "NEW BUTTON"]
    });
  };

  const updateButton = (index, value) => {
    const newBtns = [...editingTemplate.interactiveButtons];
    newBtns[index] = value;
    setEditingTemplate({ ...editingTemplate, interactiveButtons: newBtns });
  };

  const removeButton = (index) => {
    const newBtns = editingTemplate.interactiveButtons.filter((_, i) => i !== index);
    setEditingTemplate({ ...editingTemplate, interactiveButtons: newBtns });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-green-500">💬</span> WhatsApp Templates
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Design WhatsApp Business messages with Interactive Quick Reply buttons.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">WhatsApp Triggers</h3>
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
                        ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6">
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Edit: {editingTemplate.name}
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
                        <div className={`block w-10 h-6 rounded-full transition ${editingTemplate.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${editingTemplate.isActive ? 'translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>

                  <form onSubmit={handleSave}>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Message Body
                      </label>
                      <textarea
                        required
                        rows="5"
                        value={editingTemplate.message}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Hello {{memberName}}..."
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        Vars: {'{{memberName}}'}, {'{{bookName}}'}, {'{{dueDate}}'}, {'{{fineAmount}}'}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Interactive Buttons</label>
                        <button type="button" onClick={addInteractiveButton} className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded font-bold text-gray-700 dark:text-gray-300">
                          + Add Button
                        </button>
                      </div>
                      
                      {editingTemplate.interactiveButtons.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No buttons added.</p>
                      ) : (
                        <div className="space-y-2">
                          {editingTemplate.interactiveButtons.map((btn, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                maxLength="20"
                                value={btn}
                                onChange={(e) => updateButton(idx, e.target.value)}
                                className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-sm"
                                placeholder="Button Text (e.g. RENEW NOW)"
                              />
                              <button type="button" onClick={() => removeButton(idx)} className="text-red-500 hover:text-red-700 px-2">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-start gap-3 mt-8">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold"
                      >
                        Save Template
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTemplate(null)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* WhatsApp Preview UI */}
                <div className="w-full md:w-64 flex-shrink-0">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2 text-center">Preview</p>
                  <div className="bg-[#e5ddd5] rounded-xl overflow-hidden h-[400px] shadow-inner relative flex flex-col border-[6px] border-gray-800">
                    <div className="bg-[#075e54] text-white p-3 text-sm font-bold flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#075e54] text-xs">L</div>
                      LibraryOS
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto">
                      <div className="bg-white rounded-lg p-3 text-sm shadow-sm relative text-gray-800 break-words whitespace-pre-wrap rounded-tl-none ml-1">
                        {editingTemplate.message || "Your message here..."}
                        
                        {editingTemplate.interactiveButtons.length > 0 && (
                          <div className="mt-2 border-t border-gray-100 pt-2 flex flex-col gap-2">
                            {editingTemplate.interactiveButtons.map((btn, i) => (
                              <div key={i} className="text-[#00a884] font-bold text-center py-1 text-sm bg-gray-50 rounded">
                                {btn || "Button"}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center h-full flex flex-col justify-center items-center">
                <span className="text-6xl mb-4 opacity-50">💬</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select an Event</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                  Choose an event from the left sidebar to edit the WhatsApp template.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTemplates;
