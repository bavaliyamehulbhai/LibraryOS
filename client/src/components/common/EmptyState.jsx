import React from 'react';

const EmptyState = ({ title, description, icon, actionText, onAction }) => {
  return (
    <div className="text-center py-16 px-4 sm:px-6 lg:px-8 border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-700">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 text-3xl mb-4">
        {icon || '📁'}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        {description}
      </p>
      {actionText && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
