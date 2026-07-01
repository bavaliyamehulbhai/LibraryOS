import React from 'react';

const ProgressBar = ({ percentage, currentStepName, stepIndex, totalSteps }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700">Step {stepIndex} of {totalSteps}: {currentStepName}</span>
        <span className="text-sm font-bold text-blue-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
