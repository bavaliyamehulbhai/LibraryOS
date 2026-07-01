import React from 'react';
import StatCard from '../../components/dashboard/StatCard';

const ActivationDashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activation Dashboard</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Track onboarding progress and platform adoption metrics.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
          <span className="text-sm text-blue-700 font-medium">Global Activation Score: </span>
          <span className="text-xl font-bold text-blue-800 ml-2">92%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Books Imported" value="12,450" icon="📚" trend="View Data" trendUp={true} />
        <StatCard title="Students Imported" value="840" icon="🎓" trend="View Data" trendUp={true} />
        <StatCard title="Branches Created" value="3" icon="🏢" />
        <StatCard title="Staff Users Added" value="12" icon="👥" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Setup Checklist</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="font-medium text-green-800">Library Profile Created</span>
              </div>
              <span className="text-xs text-green-600">Completed</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="font-medium text-green-800">Branch Added</span>
              </div>
              <span className="text-xs text-green-600">Completed</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="font-medium text-green-800">Automation Settings Configured</span>
              </div>
              <span className="text-xs text-green-600">Completed</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <span className="text-gray-400 mr-3 text-xl">⏳</span>
                <span className="font-medium text-gray-700">Import Book Catalog</span>
              </div>
              <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Start Import</button>
            </li>
            <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <span className="text-gray-400 mr-3 text-xl">⏳</span>
                <span className="font-medium text-gray-700">Import Students List</span>
              </div>
              <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Start Import</button>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Smart Recommendations</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
              <h4 className="font-bold text-yellow-800 text-sm mb-1">Upload Your First Book</h4>
              <p className="text-sm text-yellow-700">Your inventory is empty. Students won't be able to issue books until you add inventory.</p>
              <button className="mt-3 text-xs font-bold text-yellow-800 bg-yellow-200 px-3 py-1.5 rounded hover:bg-yellow-300">Go to Inventory</button>
            </div>
            
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r-lg">
              <h4 className="font-bold text-blue-800 text-sm mb-1">Invite Library Staff</h4>
              <p className="text-sm text-blue-700">You are the only user in this library. Invite librarians and assistants to share the workload.</p>
              <button className="mt-3 text-xs font-bold text-blue-800 bg-blue-200 px-3 py-1.5 rounded hover:bg-blue-300">Invite Users</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationDashboard;
