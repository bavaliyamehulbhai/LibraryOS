import React from "react";

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, bgColorClass }) => {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        {subtitle && <p className={`text-xs mt-2 opacity-80 ${colorClass}`}>{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-4 rounded-full ${bgColorClass}`}>
          <Icon className={colorClass} size={28} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
