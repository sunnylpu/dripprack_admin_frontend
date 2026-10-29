import React, { forwardRef } from 'react';

/**
 * Tactical Utilitarian Input Field matching DripRack Design System
 */
export const Input = forwardRef(function Input(
  {
    label,
    topRightLabel,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = '',
    id,
    type = 'text',
    required,
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {(label || topRightLabel) && (
        <div className="flex justify-between items-center text-xs">
          {label && (
            <label
              htmlFor={inputId}
              className="font-mono text-on-surface-variant uppercase tracking-wider font-medium select-none"
            >
              {label} {required && <span className="text-primary">*</span>}
            </label>
          )}
          {topRightLabel && (
            <div className="font-mono text-outline-variant text-[11px] select-none">
              {topRightLabel}
            </div>
          )}
        </div>
      )}

      <div
        className={`relative flex items-center bg-surface-container-low border transition-all duration-150 ${
          error
            ? 'border-error focus-within:ring-1 focus-within:ring-error'
            : 'border-outline-variant/30 focus-within:border-primary/60 focus-within:bg-surface-container'
        }`}
      >
        {Icon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-outline-variant">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full bg-transparent text-on-surface font-body text-sm py-2.5 outline-none placeholder:text-outline-variant/50 disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-9' : 'pl-3'
          } ${rightElement ? 'pr-10' : 'pr-3'} ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <span className="font-mono text-xs text-error mt-0.5 tracking-tight flex items-center gap-1">
          {error}
        </span>
      ) : helperText ? (
        <span className="font-mono text-xs text-outline-variant mt-0.5">
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

