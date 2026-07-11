import React from 'react';

const ProfileCard = ({ profile, plan }) => {
  if (!profile) return null;

  return (
    <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700/50 shadow-2xl shadow-blue-900/5 dark:shadow-black/40 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 h-full overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="flex-shrink-0 relative">
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
        {profile.profileImage && profile.profileImage !== 'default-avatar.png' ? (
          <img src={profile.profileImage} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg relative z-10" />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 text-4xl font-black flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg relative z-10">
            {profile.name?.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left w-full h-full flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{profile.name}</h2>
              <p className="text-gray-500 font-mono mt-1 dark:text-gray-400">{profile.memberCode}</p>
            </div>
            <div className="mt-3 md:mt-0">
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 bg-gray-50/80 dark:bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-inner">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Membership Plan</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{plan ? plan.name : "No Active Plan"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Borrow Limit</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{plan ? `${plan.borrowLimit} Books` : "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Contact</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{profile.email}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Plan Expires</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {plan?.expiryDate ? new Date(plan.expiryDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
