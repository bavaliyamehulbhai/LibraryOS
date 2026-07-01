import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFloors, useCreateFloor } from "../../hooks/useShelves";
import toast from "react-hot-toast";

const Floors = () => {
  const { data: floorsData, isLoading } = useFloors();
  const createFloor = useCreateFloor();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const floors = floorsData?.data || [];

  const handleCreate = (e) => {
    e.preventDefault();
    createFloor.mutate({ name, description }, {
      onSuccess: () => {
        toast.success("Floor created successfully");
        setName("");
        setDescription("");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to create floor")
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-4 mb-6 border-b pb-4">
        <Link to="/shelves/floors" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Floors</Link>
        <Link to="/shelves/sections" className="text-gray-500 hover:text-blue-600">Sections</Link>
        <Link to="/shelves/racks" className="text-gray-500 hover:text-blue-600">Racks</Link>
        <Link to="/shelves" className="text-gray-500 hover:text-blue-600">Shelves Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-bold mb-4">Add New Floor</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Name *</label>
                <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Ground Floor" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional details..."></textarea>
              </div>
              <button type="submit" disabled={createFloor.isLoading} className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {createFloor.isLoading ? "Creating..." : "Create Floor"}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800">Library Floors</h3>
            </div>
            {isLoading ? <div className="p-8 text-center text-gray-500">Loading floors...</div> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {floors.map(f => (
                    <tr key={f._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{f.name}</td>
                      <td className="px-4 py-3 text-gray-500">{f.description || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${f.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {f.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {floors.length === 0 && <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No floors added yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Floors;
