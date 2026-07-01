import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRacks, useCreateRack, useFloors, useSections } from "../../hooks/useShelves";
import toast from "react-hot-toast";

const Racks = () => {
  const { data: racksData, isLoading } = useRacks();
  const { data: floorsData } = useFloors();
  const { data: sectionsData } = useSections();
  const createRack = useCreateRack();
  
  const [rackCode, setRackCode] = useState("");
  const [floorId, setFloorId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const racks = racksData?.data || [];
  const floors = floorsData?.data || [];
  const sections = sectionsData?.data || [];

  const filteredSections = sections.filter(s => s.floorId?._id === floorId);

  const handleCreate = (e) => {
    e.preventDefault();
    createRack.mutate({ rackCode, floorId, sectionId }, {
      onSuccess: () => {
        toast.success("Rack created successfully");
        setRackCode("");
        setFloorId("");
        setSectionId("");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to create rack")
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-4 mb-6 border-b pb-4">
        <Link to="/shelves/floors" className="text-gray-500 hover:text-blue-600">Floors</Link>
        <Link to="/shelves/sections" className="text-gray-500 hover:text-blue-600">Sections</Link>
        <Link to="/shelves/racks" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Racks</Link>
        <Link to="/shelves" className="text-gray-500 hover:text-blue-600">Shelves Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-bold mb-4">Add New Rack</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                <select required value={floorId} onChange={e=>{setFloorId(e.target.value); setSectionId("");}} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Floor...</option>
                  {floors.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select required value={sectionId} onChange={e=>setSectionId(e.target.value)} disabled={!floorId} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  <option value="">Select Section...</option>
                  {filteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rack Code *</label>
                <input type="text" required value={rackCode} onChange={e=>setRackCode(e.target.value)} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. RACK-A" />
              </div>
              <button type="submit" disabled={createRack.isLoading} className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {createRack.isLoading ? "Creating..." : "Create Rack"}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800">Library Racks</h3>
            </div>
            {isLoading ? <div className="p-8 text-center text-gray-500">Loading racks...</div> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Floor</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Section</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Rack Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {racks.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{r.floorId?.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.sectionId?.name || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.rackCode}</td>
                    </tr>
                  ))}
                  {racks.length === 0 && <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No racks added yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Racks;
