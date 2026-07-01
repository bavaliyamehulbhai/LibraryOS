import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md border-l-4 ${color} bg-white flex items-center justify-between`}>
      <div>
        <p className="text-gray-500 text-sm font-semibold uppercase">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')} text-${color.replace('border-', '')}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
