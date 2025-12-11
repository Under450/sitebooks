import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-charcoal mb-2">
          {label}
          {props.required && <span className="text-cost ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 
          border-2 border-gray-200 rounded-xl
          focus:border-amber focus:outline-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
          text-charcoal
          ${error ? 'border-cost' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-cost">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}
