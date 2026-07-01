import React from 'react';

const TopLibraries = ({ libraries }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Top Libraries</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th scope="col" className="px-6 py-3">Library Name</th>
              <th scope="col" className="px-6 py-3">Plan</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {libraries && libraries.length > 0 ? libraries.map((lib, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{lib.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {lib.subscriptionId?.name || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${lib.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {lib.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(lib.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No libraries available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopLibraries;
