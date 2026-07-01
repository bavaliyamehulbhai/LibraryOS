import React from 'react';

const ProfileCard = ({ profile, plan }) => {
  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
      
      <div className="flex-shrink-0">
        {profile.profileImage && profile.profileImage !== 'default-avatar.png' ? (
          <img src={profile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 dark:border-gray-700 shadow-sm" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-3xl font-bold flex items-center justify-center border-4 border-blue-50 dark:border-gray-700 shadow-sm">
            {profile.name?.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-gray-500 font-medium dark:text-gray-400">{profile.memberCode}</p>
          </div>
          <div className="mt-2 md:mt-0">
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {profile.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 dark:text-gray-400">Membership Plan</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{plan ? plan.name : "No Active Plan"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 dark:text-gray-400">Borrow Limit</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{plan ? `${plan.borrowLimit} Books` : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 dark:text-gray-400">Contact</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 dark:text-gray-400">Plan Expires</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {plan?.expiryDate ? new Date(plan.expiryDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileCard;
