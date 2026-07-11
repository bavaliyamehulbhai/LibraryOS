import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useShelves, useCreateShelf, useShelfAnalytics } from "../../hooks/useShelves";
import toast from "react-hot-toast";

const Shelves = () => {
  const { data: shelvesData, isLoading } = useShelves();
  const { data: analyticsData } = useShelfAnalytics();
  
  const createShelf = useCreateShelf();
  
  const [shelfCode, setShelfCode] = useState("");
  const [category, setCategory] = useState("");
  const [floor, setFloor] = useState("");
  const [section, setSection] = useState("");
  const [rack, setRack] = useState("");
  const [capacity, setCapacity] = useState("");

  const shelves = shelvesData?.data || [];
  const analytics = analyticsData?.data || { totalShelves: 0, fullShelves: 0, availableShelves: 0, globalOccupancyPercent: 0 };

  const handleCreate = (e) => {
    e.preventDefault();
    createShelf.mutate({ shelfCode, category, floor, section, rack, capacity: Number(capacity) }, {
      onSuccess: () => {
        toast.success("Shelf created successfully");
        setShelfCode("");
        setCategory("");
        setFloor("");
        setSection("");
        setRack("");
        setCapacity("");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to create shelf")
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shelf Management System</h1>
          <p className="text-gray-600 mt-1">Manage physical storage locations and occupancy.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b pb-4">
        <Link to="/shelves/floors" className="text-gray-500 hover:text-blue-600">Floors</Link>
        <Link to="/shelves/sections" className="text-gray-500 hover:text-blue-600">Sections</Link>
        <Link to="/shelves/racks" className="text-gray-500 hover:text-blue-600">Racks</Link>
        <Link to="/shelves" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Shelves Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 hover:-translate-y-1 transition-all border-b-4 border-b-slate-400">
          <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Total Shelves</h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{analytics.totalShelves}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 hover:-translate-y-1 transition-all border-b-4 border-b-green-500">
          <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Available Shelves</h3>
          <p className="text-3xl font-black text-green-600">{analytics.availableShelves}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 hover:-translate-y-1 transition-all border-b-4 border-b-red-500">
          <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Full Shelves</h3>
          <p className="text-3xl font-black text-red-600">{analytics.fullShelves}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 hover:-translate-y-1 transition-all border-b-4 border-b-blue-500">
          <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Global Occupancy</h3>
          <p className="text-3xl font-black text-blue-600">{analytics.globalOccupancyPercent}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-500">➕</span> Add New Shelf
            </h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Floor *</label>
                <input type="text" required value={floor} onChange={e=>setFloor(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm dark:text-white" placeholder="e.g. Ground Floor" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Section *</label>
                <input type="text" required value={section} onChange={e=>setSection(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm dark:text-white" placeholder="e.g. Technology" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Rack *</label>
                <input type="text" required value={rack} onChange={e=>setRack(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm dark:text-white" placeholder="e.g. Rack A" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <input type="text" required value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm dark:text-white" placeholder="e.g. Fiction" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Shelf Code *</label>
                <input type="text" required value={shelfCode} onChange={e=>setShelfCode(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm dark:text-white" placeholder="e.g. A-12" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Capacity (Max Books) *</label>
                <input type="number" min="1" required value={capacity} onChange={e=>setCapacity(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm dark:text-white" placeholder="e.g. 50" />
              </div>
              <button type="submit" disabled={createShelf.isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {createShelf.isLoading ? "Creating..." : "Create Shelf"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-2xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden">
            <div className="p-6 bg-white/50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Master Shelves Directory</h3>
            </div>
            {isLoading ? <div className="p-8 text-center text-gray-500">Loading shelves...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400">Location Path</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400">Category</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400">Shelf Code</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400">Occupancy</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {shelves.map(s => {
                      const occPercent = Math.round((s.occupiedSlots / s.capacity) * 100) || 0;
                      return (
                        <tr key={s._id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition">
                          <td className="px-6 py-4">
                            <div className="text-gray-900 dark:text-white font-bold">{s.floor} &gt; {s.section}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Rack {s.rack}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{s.category}</td>
                          <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{s.shelfCode}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-gray-800 dark:text-gray-200">{s.occupiedSlots} / {s.capacity}</span>
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 shadow-inner">
                                <div className={`h-1.5 rounded-full ${occPercent > 90 ? 'bg-red-500' : occPercent > 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} style={{ width: `${Math.min(occPercent, 100)}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                              ${occPercent < 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {occPercent < 90 ? 'ACTIVE' : 'FULL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/shelves/${s._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 transition">Details</Link>
                          </td>
                        </tr>
                      );
                    })}
                    {shelves.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No shelves added yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shelves;
