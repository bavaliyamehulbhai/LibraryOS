import React from "react";

const ChartCard = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        {Icon && <Icon className="text-gray-500" />}
        <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
