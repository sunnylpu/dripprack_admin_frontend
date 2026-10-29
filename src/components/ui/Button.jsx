import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Tactical Utilitarian Button Component matching DripRack Design System
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-headline uppercase tracking-wider transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variants = {
    primary:
      'bg-primary-container text-on-primary-container hover:brightness-110 shadow-sm font-semibold border border-primary/20',
    secondary:
      'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30',
    destructive:
      'bg-error-container text-on-error-container hover:bg-error/30 border border-error/40 font-semibold',
    ghost:
      'bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-sm gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-md gap-2',
    lg: 'text-base px-5 py-3.5 rounded-md gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 text-current shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

