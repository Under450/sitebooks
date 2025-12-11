import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-charcoal mb-2">
          {label}
          {props.required && <span className="text-cost ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 
          border-2 border-gray-200 rounded-xl
          focus:border-amber focus:outline-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
          text-charcoal
          resize-none
          ${error ? 'border-cost' : ''}
          ${className}
        `}
        rows={4}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-cost">{error}</p>
      )}
    </div>
  );
}
