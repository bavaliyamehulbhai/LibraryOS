import React from 'react';

const SetupChecklist = ({ completedSteps }) => {
  const steps = [
    { id: "LIBRARY_SETUP", label: "Library Created" },
    { id: "ADMIN_SETUP", label: "Admin Profile Setup" },
    { id: "BRANCH_SETUP", label: "Branches Configured" },
    { id: "BOOK_IMPORT", label: "Books Imported" },
    { id: "STUDENT_IMPORT", label: "Students Imported" },
    { id: "SETTINGS_SETUP", label: "Library Settings Configured" }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Setup Checklist</h3>
      <ul className="space-y-3">
        {steps.map(step => {
          const isCompleted = completedSteps.includes(step.id);
          return (
            <li key={step.id} className="flex items-center">
              {isCompleted ? (
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3"></div>
              )}
              <span className={`text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SetupChecklist;
