import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useScheduledExports, useScheduleExport } from "../../hooks/useExport";
import { Calendar, Mail, FileText, CheckCircle } from "lucide-react";

const ScheduledExports = () => {
  const { data, isLoading } = useScheduledExports();
  const scheduleMutation = useScheduleExport();
  const schedules = data?.data || [];

  const [form, setForm] = useState({
    frequency: "WEEKLY",
    type: "inventory",
    format: "pdf",
    email: ""
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email) return alert("Email is required.");
    try {
      await scheduleMutation.mutateAsync({
        frequency: form.frequency,
        type: form.type,
        format: form.format,
        recipients: [form.email]
      });
      setForm({ ...form, email: "" });
      alert("Scheduled Report Created!");
    } catch (err) {
      alert("Failed to schedule report");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Scheduled Reports</h1>
          <p className="text-gray-500">Automate your reporting. Get CSV, Excel, or PDF reports delivered straight to your inbox.</p>
        </div>
        <div className="space-x-4">
          <Link to="/export" className="text-blue-600 hover:underline text-sm font-medium">Export Center</Link>
          <Link to="/export/history" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition">View History</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Create Form */}
        <div className="lg:col-span-1 bg-white border rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} /> New Schedule
          </h2>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Frequency</label>
              <select 
                value={form.frequency} 
                onChange={(e) => setForm({...form, frequency: e.target.value})}
                className="w-full border-2 border-gray-200 rounded p-2 bg-gray-50 focus:outline-none focus:border-blue-500"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Data Module</label>
              <select 
                value={form.type} 
                onChange={(e) => setForm({...form, type: e.target.value})}
                className="w-full border-2 border-gray-200 rounded p-2 bg-gray-50 focus:outline-none focus:border-blue-500"
              >
                <option value="books">Book Catalog</option>
                <option value="inventory">Inventory & Stock</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Format</label>
              <select 
                value={form.format} 
                onChange={(e) => setForm({...form, format: e.target.value})}
                className="w-full border-2 border-gray-200 rounded p-2 bg-gray-50 focus:outline-none focus:border-blue-500"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email To</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded focus:outline-none focus:border-blue-500"
                  placeholder="admin@library.com"
                  required
                />
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={scheduleMutation.isPending}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 mt-4"
            >
              {scheduleMutation.isPending ? "Saving..." : "Create Schedule"}
            </button>
          </form>
        </div>

        {/* Right: Existing Schedules */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-10 text-gray-400">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-20 bg-white border rounded-xl">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No Active Schedules</h3>
              <p className="text-gray-500 mt-2">Create a schedule to automatically receive reports.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase">{schedule.frequency}</span>
                      {schedule.isActive && <span className="text-green-500" title="Active"><CheckCircle size={16}/></span>}
                    </div>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded uppercase">{schedule.format}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 capitalize text-lg">{schedule.type} Report</h3>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{schedule.recipients.join(", ")}</span>
                    </p>
                    <p className="text-gray-500 text-xs">
                      Created by: {schedule.createdBy?.firstName || 'System'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledExports;
