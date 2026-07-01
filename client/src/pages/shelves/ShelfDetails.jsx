import React from "react";
import { useParams, Link } from "react-router-dom";
import { useShelfDetails } from "../../hooks/useShelves";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";

const ShelfDetails = () => {
  const { id } = useParams();
  const { data: shelfData, isLoading } = useShelfDetails(id);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading shelf details...</div>;
  if (!shelfData?.data) return <div className="p-8 text-center text-red-500">Shelf not found.</div>;

  const { shelf, copies } = shelfData.data;
  const occPercent = Math.round((shelf.occupied / shelf.capacity) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/shelves" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Shelf Details: {shelf.shelfCode}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Location Path</h2>
          <div className="flex items-center gap-3 text-lg font-medium text-gray-800 bg-gray-50 p-4 rounded-lg border">
            <Layers className="text-blue-500" />
            <span>{shelf.floorId?.name}</span>
            <span className="text-gray-400">/</span>
            <span>{shelf.sectionId?.name}</span>
            <span className="text-gray-400">/</span>
            <span>Rack {shelf.rackId?.rackCode}</span>
            <span className="text-gray-400">/</span>
            <span className="text-blue-600 font-bold">{shelf.shelfCode}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Occupancy</h2>
          <div className="text-4xl font-bold text-gray-900 mb-2">{shelf.occupied} <span className="text-lg text-gray-400">/ {shelf.capacity}</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div className={`h-2.5 rounded-full ${occPercent > 90 ? 'bg-red-500' : occPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${occPercent}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 font-medium">{occPercent}% Full</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
          <BookOpen className="text-gray-500" size={18} />
          <h3 className="font-semibold text-gray-800">Books on this Shelf</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Copy Code</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {copies.map(copy => (
                <tr key={copy._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-semibold text-blue-600">{copy.copyCode}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{copy.bookId?.title || "Unknown Book"}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">{copy.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{copy.condition}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/copies/${copy._id}`} className="text-blue-600 hover:underline">View Copy</Link>
                  </td>
                </tr>
              ))}
              {copies.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">This shelf is currently empty.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShelfDetails;
