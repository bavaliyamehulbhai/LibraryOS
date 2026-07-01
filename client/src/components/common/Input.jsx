import { forwardRef } from 'react';

const Input = forwardRef(({ label, type = 'text', error, placeholder, ...rest }, ref) => {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        ref={ref}
        placeholder={placeholder}
        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
        }`}
        {...rest}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">
          {error.message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
