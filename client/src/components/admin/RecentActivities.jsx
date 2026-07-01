import React from 'react';

const RecentActivities = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activities</h3>
      {activities && activities.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {activities.map((act, idx) => (
            <li key={idx} className="py-3">
              <p className="text-sm text-gray-800">
                <span className="font-semibold text-blue-600">{act.action}</span> - {act.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No recent activities found.</p>
      )}
    </div>
  );
};

export default RecentActivities;
