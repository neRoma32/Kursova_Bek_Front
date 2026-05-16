import { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classes) => twMerge(clsx(classes));

export const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  children, 
  disabled, 
  startIcon,
  endIcon,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-accent-600 text-white hover:bg-accent-500 shadow-sm',
    secondary: 'bg-accent-100 text-accent-600 hover:bg-accent-50',
    outline: 'border border-border bg-transparent hover:bg-surfaceHover text-text',
    ghost: 'bg-transparent hover:bg-surfaceHover text-textMuted hover:text-text',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs rounded-lg',
    lg: 'h-12 px-8 text-base rounded-2xl',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
