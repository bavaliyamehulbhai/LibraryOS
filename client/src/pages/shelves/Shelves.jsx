import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useShelves, useCreateShelf, useFloors, useSections, useRacks, useShelfAnalytics } from "../../hooks/useShelves";
import toast from "react-hot-toast";

const Shelves = () => {
  const { data: shelvesData, isLoading } = useShelves();
  const { data: analyticsData } = useShelfAnalytics();
  const { data: floorsData } = useFloors();
  const { data: sectionsData } = useSections();
  const { data: racksData } = useRacks();
  
  const createShelf = useCreateShelf();
  
  const [shelfCode, setShelfCode] = useState("");
  const [shelfNumber, setShelfNumber] = useState("");
  const [floorId, setFloorId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [rackId, setRackId] = useState("");
  const [capacity, setCapacity] = useState("");

  const shelves = shelvesData?.data || [];
  const floors = floorsData?.data || [];
  const sections = sectionsData?.data || [];
  const racks = racksData?.data || [];
  const analytics = analyticsData?.data || { totalShelves: 0, fullShelves: 0, availableShelves: 0, globalOccupancyPercent: 0 };

  const filteredSections = sections.filter(s => s.floorId?._id === floorId);
  const filteredRacks = racks.filter(r => r.sectionId?._id === sectionId);

  const handleCreate = (e) => {
    e.preventDefault();
    createShelf.mutate({ shelfCode, shelfNumber, floorId, sectionId, rackId, capacity: Number(capacity) }, {
      onSuccess: () => {
        toast.success("Shelf created successfully");
        setShelfCode("");
        setShelfNumber("");
        setRackId("");
        setCapacity("");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to create shelf")
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Total Shelves</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalShelves}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Available Shelves</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.availableShelves}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Full Shelves</h3>
          <p className="text-3xl font-bold text-red-600">{analytics.fullShelves}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Global Occupancy</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.globalOccupancyPercent}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Add New Shelf</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                <select required value={floorId} onChange={e=>{setFloorId(e.target.value); setSectionId(""); setRackId("");}} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">Select Floor...</option>
                  {floors.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select required value={sectionId} onChange={e=>{setSectionId(e.target.value); setRackId("");}} disabled={!floorId} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100">
                  <option value="">Select Section...</option>
                  {filteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rack *</label>
                <select required value={rackId} onChange={e=>setRackId(e.target.value)} disabled={!sectionId} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100">
                  <option value="">Select Rack...</option>
                  {filteredRacks.map(r => <option key={r._id} value={r._id}>{r.rackCode}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Code *</label>
                <input type="text" required value={shelfCode} onChange={e=>setShelfCode(e.target.value)} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. SHELF-001" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Number *</label>
                <input type="text" required value={shelfNumber} onChange={e=>setShelfNumber(e.target.value)} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. 1" />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Max Books) *</label>
                <input type="number" min="1" required value={capacity} onChange={e=>setCapacity(e.target.value)} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. 50" />
              </div>
              <button type="submit" disabled={createShelf.isLoading} className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {createShelf.isLoading ? "Creating..." : "Create Shelf"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800">Master Shelves Directory</h3>
            </div>
            {isLoading ? <div className="p-8 text-center text-gray-500">Loading shelves...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Location Path</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Shelf Code</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">Occupancy</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {shelves.map(s => {
                      const occPercent = Math.round((s.occupied / s.capacity) * 100);
                      return (
                        <tr key={s._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-gray-900 font-medium">{s.floorId?.name} &gt; {s.sectionId?.name}</div>
                            <div className="text-xs text-gray-500">Rack {s.rackId?.rackCode}</div>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-blue-600">{s.shelfCode}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-gray-800">{s.occupied} / {s.capacity}</span>
                              <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                <div className={`h-1.5 rounded-full ${occPercent > 90 ? 'bg-red-500' : occPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${occPercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold
                              ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                s.status === 'FULL' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link to={`/shelves/${s._id}`} className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded bg-blue-50 transition">Details</Link>
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
