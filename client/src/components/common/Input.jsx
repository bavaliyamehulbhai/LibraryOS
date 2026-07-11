import { forwardRef } from 'react';

const Input = forwardRef(({ label, type = 'text', error, placeholder, ...rest }, ref) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        ref={ref}
        placeholder={placeholder}
        className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm bg-white dark:bg-slate-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:ring-indigo-500/50 dark:focus:border-indigo-500 transition-colors duration-200 sm:text-sm ${
          error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
        }`}
        {...rest}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
