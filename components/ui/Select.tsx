import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-charcoal mb-2">
          {label}
          {props.required && <span className="text-cost ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 
          border-2 border-gray-200 rounded-xl
          focus:border-amber focus:outline-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
          text-charcoal
          appearance-none bg-white
          ${error ? 'border-cost' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-cost">{error}</p>
      )}
    </div>
  );
}
